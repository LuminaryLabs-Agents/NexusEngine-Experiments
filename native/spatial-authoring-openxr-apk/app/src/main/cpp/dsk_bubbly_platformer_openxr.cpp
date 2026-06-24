#include <android/input.h>
#include <android/log.h>
#include <android_native_app_glue.h>
#include <EGL/egl.h>
#include <GLES3/gl3.h>
#include <openxr/openxr.h>
#include <openxr/openxr_platform.h>
#include <algorithm>
#include <cmath>
#include <cstring>
#include <vector>

#define LOG_TAG "DSKBubblyPlatformerXR"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

struct Color { float r, g, b, a; };
struct Vec3 { float x, y, z; };
struct Mat4 { float m[16]; };
struct Rect { float x, y, w, h; Color color; };
struct Bubble { float x, y, vx, vy, ttl, size; Color color; };

static float clampf(float v, float lo, float hi) { return std::max(lo, std::min(v, hi)); }
static bool xr_ok(XrResult result, const char* label) { if (XR_FAILED(result)) { LOGE("%s failed: %d", label, result); return false; } return true; }
static XrPosef identity_pose() { XrPosef pose{}; pose.orientation.w = 1.0f; return pose; }
static Mat4 identity() { Mat4 r{}; r.m[0] = r.m[5] = r.m[10] = r.m[15] = 1.0f; return r; }
static Mat4 translate(float x, float y, float z) { Mat4 r = identity(); r.m[12] = x; r.m[13] = y; r.m[14] = z; return r; }
static Mat4 scale(float x, float y, float z) { Mat4 r = identity(); r.m[0] = x; r.m[5] = y; r.m[10] = z; return r; }
static Mat4 mul(const Mat4& a, const Mat4& b) { Mat4 r{}; for (int c=0;c<4;++c) for (int row=0;row<4;++row) for (int k=0;k<4;++k) r.m[c*4+row] += a.m[k*4+row] * b.m[c*4+k]; return r; }
static Mat4 projection(const XrFovf& fov) { float l=std::tan(fov.angleLeft), r=std::tan(fov.angleRight), d=std::tan(fov.angleDown), u=std::tan(fov.angleUp); float w=r-l, h=u-d, n=0.05f, f=80.0f; Mat4 m{}; m.m[0]=2.0f/w; m.m[5]=2.0f/h; m.m[8]=(r+l)/w; m.m[9]=(u+d)/h; m.m[10]=-(f+n)/(f-n); m.m[11]=-1.0f; m.m[14]=-(2.0f*f*n)/(f-n); return m; }
static Mat4 view_from_pose(const XrPosef& pose) { XrQuaternionf q=pose.orientation; float x=-q.x,y=-q.y,z=-q.z,w=q.w; Mat4 r=identity(); r.m[0]=1-2*y*y-2*z*z; r.m[1]=2*x*y+2*w*z; r.m[2]=2*x*z-2*w*y; r.m[4]=2*x*y-2*w*z; r.m[5]=1-2*x*x-2*z*z; r.m[6]=2*y*z+2*w*x; r.m[8]=2*x*z+2*w*y; r.m[9]=2*y*z-2*w*x; r.m[10]=1-2*x*x-2*y*y; return mul(r, translate(-pose.position.x, -pose.position.y, -pose.position.z)); }
static Vec3 rotate_vec(const XrQuaternionf& q, Vec3 v) { Vec3 u{q.x,q.y,q.z}; float s=q.w; Vec3 a{u.y*v.z-u.z*v.y, u.z*v.x-u.x*v.z, u.x*v.y-u.y*v.x}; Vec3 b{u.y*a.z-u.z*a.y, u.z*a.x-u.x*a.z, u.x*a.y-u.y*a.x}; return {v.x+2*(s*a.x+b.x), v.y+2*(s*a.y+b.y), v.z+2*(s*a.z+b.z)}; }

class BubblyPlatformerState {
public:
  float playerX = 1.5f, playerY = 1.0f, vx = 0.0f, vy = 0.0f;
  float axisX = 0.0f;
  bool grounded = true;
  int score = 0;
  float aimX = 0.0f, aimY = 1.55f;
  std::vector<int> coins{0,0,0};
  std::vector<Rect> solids;
  std::vector<Rect> hazards;
  std::vector<Bubble> bubbles;

  void reset() {
    playerX = 1.5f; playerY = 1.0f; vx = 0.0f; vy = 0.0f; axisX = 0.0f; grounded = true; score = 0; coins = {0,0,0}; bubbles.clear();
    solids = {{0,0,32,1,{0.38f,0.56f,1.0f,1}}, {5,3,5,0.5f,{0.38f,0.56f,1,1}}, {13,5,4,0.5f,{0.45f,0.74f,1,1}}, {21,3.5f,6,0.5f,{0.38f,0.56f,1,1}}};
    hazards = {{10.5f,0.95f,2,0.25f,{1.0f,0.16f,0.32f,1}}};
    LOGI("DSK bubbly platformer restored: full OpenXR immersion, move axis, grip/primary/trigger jump, click bubbles");
  }

  void set_axis(float x) { axisX = clampf(x, -1.0f, 1.0f); }
  void set_aim(float x, float y) { aimX = clampf(x, -0.82f, 0.82f); aimY = clampf(y, 1.05f, 2.05f); }

  void jump() {
    if (!grounded) return;
    vy = 13.0f;
    grounded = false;
    burst(0.0f, playerY + 0.78f, {1,1,1,1});
    LOGI("platformer-avatar-domain-kit: jump");
  }

  void burst_at_pointer() {
    burst(aimX, aimY, {0.34f,0.86f,1.0f,1.0f});
    LOGI("platformer-effects-domain-kit: bubble burst x=%.2f y=%.2f", aimX, aimY);
  }

  void tick(float dt) {
    const float accel = 35.0f, maxSpeed = 7.0f, friction = 18.0f, gravity = -32.0f;
    if (std::fabs(axisX) > 0.02f) vx = clampf(vx + axisX * accel * dt, -maxSpeed, maxSpeed);
    else vx = std::fabs(vx) < friction * dt ? 0.0f : vx - std::copysign(friction * dt, vx);
    vy = std::max(-28.0f, vy + gravity * dt);
    float prevY = playerY;
    playerX += vx * dt;
    playerY += vy * dt;
    grounded = false;

    for (const Rect& s : solids) {
      bool overlapX = playerX + 0.35f > s.x && playerX < s.x + s.w;
      bool hitTop = prevY >= s.y + s.h - 0.05f && playerY <= s.y + s.h && overlapX && vy <= 0.0f;
      if (hitTop) { playerY = s.y + s.h; vy = 0.0f; grounded = true; }
    }

    const float coinX[3] = {6.5f,14.5f,23.5f};
    const float coinY[3] = {4.1f,6.1f,4.6f};
    for (int i=0;i<3;++i) {
      if (!coins[(size_t)i] && std::fabs(playerX-coinX[i])<0.55f && std::fabs(playerY-coinY[i])<0.75f) {
        coins[(size_t)i]=1; score++; burst((coinX[i]-camera_x())*0.075f, 1.16f+coinY[i]*0.075f, {1,0.82f,0.18f,1});
        LOGI("platformer-object-domain-kit: coin-%d collected", i+1);
      }
    }
    for (const Rect& h : hazards) if (playerX + 0.35f > h.x && playerX < h.x + h.w && playerY < 1.45f) { burst(0,1.25f,{1,0.2f,0.32f,1}); reset(); return; }
    if (playerY < -4.0f) { burst(0,1.25f,{1,0.2f,0.32f,1}); reset(); return; }
    if (playerX > 29.0f && score >= 3) { burst(0,1.6f,{0.45f,1,0.35f,1}); reset(); return; }

    for (int i=(int)bubbles.size()-1; i>=0; --i) {
      Bubble& b = bubbles[(size_t)i];
      b.ttl -= dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vy += 0.12f * dt;
      b.color.a = std::max(0.0f, b.ttl * 1.7f);
      if (b.ttl <= 0.0f) bubbles.erase(bubbles.begin()+i);
    }
  }

  float camera_x() const { return clampf(playerX - 8.0f, 0.0f, 22.0f); }

private:
  void burst(float x, float y, Color c) {
    for (int i=0;i<22;++i) {
      float a = (float)i / 22.0f * 6.2831853f;
      float s = 0.12f + 0.28f * ((i % 7) / 6.0f);
      bubbles.push_back({x, y, std::cos(a)*s, std::sin(a)*s, 0.55f, 0.018f + 0.014f*((i%3)/2.0f), c});
    }
  }
};

class Host {
public:
  explicit Host(android_app* app) : app(app) {}
  void run() {
    app->userData = this;
    app->onAppCmd = [](android_app* a, int32_t cmd){ if (cmd == APP_CMD_DESTROY) static_cast<Host*>(a->userData)->exit = true; };
    app->onInputEvent = [](android_app* a, AInputEvent* event)->int32_t { return static_cast<Host*>(a->userData)->on_input(event); };
    state.reset();
    if (!init()) LOGE("OpenXR init failed");
    while (!exit && !app->destroyRequested) {
      int events=0; android_poll_source* source=nullptr;
      while (ALooper_pollOnce(running?0:100, nullptr, &events, reinterpret_cast<void**>(&source)) >= 0) { if (source) source->process(app, source); if (app->destroyRequested) exit = true; }
      poll_events();
      if (running) frame();
    }
    shutdown();
  }
private:
  struct Swapchain { XrSwapchain handle{XR_NULL_HANDLE}; int32_t width{0}, height{0}; std::vector<XrSwapchainImageOpenGLESKHR> images; };

  int32_t on_input(AInputEvent* event) {
    if (AInputEvent_getType(event) == AINPUT_EVENT_TYPE_KEY) {
      int action = AKeyEvent_getAction(event);
      int key = AKeyEvent_getKeyCode(event);
      if (action == AKEY_EVENT_ACTION_DOWN) {
        bool jumpKey = key==AKEYCODE_BUTTON_A || key==AKEYCODE_BUTTON_B || key==AKEYCODE_BUTTON_R1 || key==AKEYCODE_BUTTON_L1 || key==AKEYCODE_BUTTON_THUMBR || key==AKEYCODE_SPACE || key==AKEYCODE_DPAD_UP;
        if (jumpKey) state.jump(); else state.burst_at_pointer();
        return 1;
      }
    }
    if (AInputEvent_getType(event) == AINPUT_EVENT_TYPE_MOTION) {
      int action = AMotionEvent_getAction(event) & AMOTION_EVENT_ACTION_MASK;
      int buttons = AMotionEvent_getButtonState(event);
      float x = AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_X, 0);
      float hat = AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_HAT_X, 0);
      if (std::fabs(hat) > std::fabs(x)) x = hat;
      state.set_axis(x);
      float trigger = std::max(AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_RTRIGGER,0), AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_GAS,0));
      float gripAxis = std::max(AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_LTRIGGER,0), AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_BRAKE,0));
      bool primary = (buttons & AMOTION_EVENT_BUTTON_PRIMARY) != 0;
      bool grip = gripAxis > 0.2f || (buttons & AMOTION_EVENT_BUTTON_SECONDARY) != 0;
      bool jumpPressed = trigger > 0.2f || primary || grip;
      if (jumpPressed && !jumpHeld) { jumpHeld = true; state.jump(); return 1; }
      if (!jumpPressed) jumpHeld = false;
      if (action == AMOTION_EVENT_ACTION_DOWN || action == AMOTION_EVENT_ACTION_POINTER_DOWN) { state.burst_at_pointer(); return 1; }
      return 1;
    }
    return 0;
  }

  bool init(){ return init_loader() && create_instance() && create_actions() && get_system() && init_egl() && create_program() && create_session() && attach_actions() && create_spaces() && create_swapchains(); }
  bool init_loader(){ PFN_xrInitializeLoaderKHR fn=nullptr; xrGetInstanceProcAddr(XR_NULL_HANDLE,"xrInitializeLoaderKHR",reinterpret_cast<PFN_xrVoidFunction*>(&fn)); if(!fn) return true; XrLoaderInitInfoAndroidKHR info{XR_TYPE_LOADER_INIT_INFO_ANDROID_KHR}; info.applicationVM=app->activity->vm; info.applicationContext=app->activity->clazz; return xr_ok(fn(reinterpret_cast<XrLoaderInitInfoBaseHeaderKHR*>(&info)),"xrInitializeLoaderKHR"); }
  bool create_instance(){ const char* exts[]={XR_KHR_ANDROID_CREATE_INSTANCE_EXTENSION_NAME,XR_KHR_OPENGL_ES_ENABLE_EXTENSION_NAME}; XrInstanceCreateInfoAndroidKHR androidInfo{XR_TYPE_INSTANCE_CREATE_INFO_ANDROID_KHR}; androidInfo.applicationVM=app->activity->vm; androidInfo.applicationActivity=app->activity->clazz; XrInstanceCreateInfo info{XR_TYPE_INSTANCE_CREATE_INFO}; info.next=&androidInfo; info.enabledExtensionCount=2; info.enabledExtensionNames=exts; std::strncpy(info.applicationInfo.applicationName,"DSK Bubbly Platformer",XR_MAX_APPLICATION_NAME_SIZE-1); std::strncpy(info.applicationInfo.engineName,"NexusRealtime",XR_MAX_ENGINE_NAME_SIZE-1); info.applicationInfo.apiVersion=XR_CURRENT_API_VERSION; return xr_ok(xrCreateInstance(&info,&instance),"xrCreateInstance"); }
  bool create_actions(){ XrActionSetCreateInfo setInfo{XR_TYPE_ACTION_SET_CREATE_INFO}; std::strncpy(setInfo.actionSetName,"dsk_bubbly_platformer",XR_MAX_ACTION_SET_NAME_SIZE-1); std::strncpy(setInfo.localizedActionSetName,"DSK Bubbly Platformer",XR_MAX_LOCALIZED_ACTION_SET_NAME_SIZE-1); if(!xr_ok(xrCreateActionSet(instance,&setInfo,&actionSet),"xrCreateActionSet")) return false; xrStringToPath(instance,"/user/hand/right",&rightHandPath); XrActionCreateInfo info{XR_TYPE_ACTION_CREATE_INFO}; info.countSubactionPaths=1; info.subactionPaths=&rightHandPath; info.actionType=XR_ACTION_TYPE_BOOLEAN_INPUT; std::strncpy(info.actionName,"jump",XR_MAX_ACTION_NAME_SIZE-1); std::strncpy(info.localizedActionName,"Jump",XR_MAX_LOCALIZED_ACTION_NAME_SIZE-1); xrCreateAction(actionSet,&info,&jumpAction); info.actionType=XR_ACTION_TYPE_POSE_INPUT; std::strncpy(info.actionName,"aim",XR_MAX_ACTION_NAME_SIZE-1); std::strncpy(info.localizedActionName,"Aim",XR_MAX_LOCALIZED_ACTION_NAME_SIZE-1); xrCreateAction(actionSet,&info,&aimAction); bind("/interaction_profiles/khr/simple_controller","/user/hand/right/input/select/click","/user/hand/right/input/menu/click","/user/hand/right/input/aim/pose"); bind("/interaction_profiles/bytedance/pico4_controller","/user/hand/right/input/trigger/click","/user/hand/right/input/squeeze/click","/user/hand/right/input/aim/pose"); bind("/interaction_profiles/bytedance/pico_neo3_controller","/user/hand/right/input/trigger/click","/user/hand/right/input/squeeze/click","/user/hand/right/input/aim/pose"); return true; }
  void bind(const char* profileName,const char* jumpAPath,const char* jumpBPath,const char* aimPath){ XrPath profile{XR_NULL_PATH}, jumpA{XR_NULL_PATH}, jumpB{XR_NULL_PATH}, aim{XR_NULL_PATH}; if(XR_FAILED(xrStringToPath(instance,profileName,&profile))) return; xrStringToPath(instance,jumpAPath,&jumpA); xrStringToPath(instance,jumpBPath,&jumpB); xrStringToPath(instance,aimPath,&aim); XrActionSuggestedBinding bindings[3]={{jumpAction,jumpA},{jumpAction,jumpB},{aimAction,aim}}; XrInteractionProfileSuggestedBinding suggested{XR_TYPE_INTERACTION_PROFILE_SUGGESTED_BINDING}; suggested.interactionProfile=profile; suggested.countSuggestedBindings=3; suggested.suggestedBindings=bindings; LOGI("binding %s result=%d", profileName, xrSuggestInteractionProfileBindings(instance,&suggested)); }
  bool get_system(){ XrSystemGetInfo info{XR_TYPE_SYSTEM_GET_INFO}; info.formFactor=XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY; return xr_ok(xrGetSystem(instance,&info,&systemId),"xrGetSystem"); }
  bool init_egl(){ display=eglGetDisplay(EGL_DEFAULT_DISPLAY); if(display==EGL_NO_DISPLAY||!eglInitialize(display,nullptr,nullptr)) return false; const EGLint attrs[]={EGL_RENDERABLE_TYPE,EGL_OPENGL_ES3_BIT,EGL_SURFACE_TYPE,EGL_PBUFFER_BIT,EGL_RED_SIZE,8,EGL_GREEN_SIZE,8,EGL_BLUE_SIZE,8,EGL_ALPHA_SIZE,8,EGL_DEPTH_SIZE,16,EGL_NONE}; EGLint n=0; if(!eglChooseConfig(display,attrs,&eglConfig,1,&n)||n<1) return false; const EGLint ctxAttrs[]={EGL_CONTEXT_CLIENT_VERSION,3,EGL_NONE}; context=eglCreateContext(display,eglConfig,EGL_NO_CONTEXT,ctxAttrs); const EGLint surfAttrs[]={EGL_WIDTH,16,EGL_HEIGHT,16,EGL_NONE}; surface=eglCreatePbufferSurface(display,eglConfig,surfAttrs); return context!=EGL_NO_CONTEXT&&surface!=EGL_NO_SURFACE&&eglMakeCurrent(display,surface,surface,context); }
  GLuint shader(GLenum type,const char* src){ GLuint id=glCreateShader(type); glShaderSource(id,1,&src,nullptr); glCompileShader(id); return id; }
  bool create_program(){ const char* vs="#version 300 es\nlayout(location=0)in vec3 p;uniform mat4 mvp;void main(){gl_Position=mvp*vec4(p,1.0);}"; const char* fs="#version 300 es\nprecision mediump float;uniform vec4 col;out vec4 o;void main(){o=col;}"; GLuint v=shader(GL_VERTEX_SHADER,vs), f=shader(GL_FRAGMENT_SHADER,fs); program=glCreateProgram(); glAttachShader(program,v); glAttachShader(program,f); glLinkProgram(program); glDeleteShader(v); glDeleteShader(f); float quad[]={-0.5f,-0.5f,0, .5f,-0.5f,0, .5f,.5f,0, -0.5f,-0.5f,0, .5f,.5f,0, -0.5f,.5f,0}; glGenBuffers(1,&vbo); glBindBuffer(GL_ARRAY_BUFFER,vbo); glBufferData(GL_ARRAY_BUFFER,sizeof(quad),quad,GL_STATIC_DRAW); return true; }
  bool create_session(){ PFN_xrGetOpenGLESGraphicsRequirementsKHR req=nullptr; xrGetInstanceProcAddr(instance,"xrGetOpenGLESGraphicsRequirementsKHR",reinterpret_cast<PFN_xrVoidFunction*>(&req)); if(!req) return false; XrGraphicsRequirementsOpenGLESKHR gr{XR_TYPE_GRAPHICS_REQUIREMENTS_OPENGL_ES_KHR}; req(instance,systemId,&gr); XrGraphicsBindingOpenGLESAndroidKHR binding{XR_TYPE_GRAPHICS_BINDING_OPENGL_ES_ANDROID_KHR}; binding.display=display; binding.config=eglConfig; binding.context=context; XrSessionCreateInfo info{XR_TYPE_SESSION_CREATE_INFO}; info.next=&binding; info.systemId=systemId; return xr_ok(xrCreateSession(instance,&info,&session),"xrCreateSession"); }
  bool attach_actions(){ XrSessionActionSetsAttachInfo info{XR_TYPE_SESSION_ACTION_SETS_ATTACH_INFO}; info.countActionSets=1; info.actionSets=&actionSet; return xr_ok(xrAttachSessionActionSets(session,&info),"xrAttachSessionActionSets"); }
  bool create_spaces(){ XrReferenceSpaceCreateInfo ref{XR_TYPE_REFERENCE_SPACE_CREATE_INFO}; ref.referenceSpaceType=XR_REFERENCE_SPACE_TYPE_LOCAL; ref.poseInReferenceSpace=identity_pose(); if(!xr_ok(xrCreateReferenceSpace(session,&ref,&space),"xrCreateReferenceSpace")) return false; XrActionSpaceCreateInfo aim{XR_TYPE_ACTION_SPACE_CREATE_INFO}; aim.action=aimAction; aim.subactionPath=rightHandPath; aim.poseInActionSpace=identity_pose(); xrCreateActionSpace(session,&aim,&aimSpace); return true; }
  int64_t choose_format(){ uint32_t count=0; xrEnumerateSwapchainFormats(session,0,&count,nullptr); std::vector<int64_t> formats(count); if(count) xrEnumerateSwapchainFormats(session,count,&count,formats.data()); return formats.empty()?GL_RGBA8:formats[0]; }
  bool create_swapchains(){ uint32_t count=0; xrEnumerateViewConfigurationViews(instance,systemId,XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,0,&count,nullptr); configViews.resize(count,{XR_TYPE_VIEW_CONFIGURATION_VIEW}); xrEnumerateViewConfigurationViews(instance,systemId,XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,count,&count,configViews.data()); views.resize(count,{XR_TYPE_VIEW}); swapchains.resize(count); projectionViews.resize(count,{XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}); int64_t fmt=choose_format(); for(uint32_t i=0;i<count;++i){ XrSwapchainCreateInfo info{XR_TYPE_SWAPCHAIN_CREATE_INFO}; info.usageFlags=XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT; info.format=fmt; info.sampleCount=configViews[i].recommendedSwapchainSampleCount; info.width=configViews[i].recommendedImageRectWidth; info.height=configViews[i].recommendedImageRectHeight; info.faceCount=1; info.arraySize=1; info.mipCount=1; if(!xr_ok(xrCreateSwapchain(session,&info,&swapchains[i].handle),"xrCreateSwapchain")) return false; swapchains[i].width=info.width; swapchains[i].height=info.height; uint32_t ic=0; xrEnumerateSwapchainImages(swapchains[i].handle,0,&ic,nullptr); swapchains[i].images.resize(ic,{XR_TYPE_SWAPCHAIN_IMAGE_OPENGL_ES_KHR}); xrEnumerateSwapchainImages(swapchains[i].handle,ic,&ic,reinterpret_cast<XrSwapchainImageBaseHeader*>(swapchains[i].images.data())); } return true; }
  void poll_events(){ XrEventDataBuffer e{XR_TYPE_EVENT_DATA_BUFFER}; while(instance&&xrPollEvent(instance,&e)==XR_SUCCESS){ if(e.type==XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED){ auto* s=reinterpret_cast<XrEventDataSessionStateChanged*>(&e); if(s->state==XR_SESSION_STATE_READY){ XrSessionBeginInfo bi{XR_TYPE_SESSION_BEGIN_INFO}; bi.primaryViewConfigurationType=XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; if(xr_ok(xrBeginSession(session,&bi),"xrBeginSession")) running=true; } else if(s->state==XR_SESSION_STATE_STOPPING){ xrEndSession(session); running=false; } else if(s->state==XR_SESSION_STATE_EXITING||s->state==XR_SESSION_STATE_LOSS_PENDING) exit=true; } e={XR_TYPE_EVENT_DATA_BUFFER}; } }
  void sync_actions(XrTime time,const XrPosef& headPose){ XrActiveActionSet active{actionSet,XR_NULL_PATH}; XrActionsSyncInfo sync{XR_TYPE_ACTIONS_SYNC_INFO}; sync.countActiveActionSets=1; sync.activeActionSets=&active; xrSyncActions(session,&sync); XrActionStateGetInfo get{XR_TYPE_ACTION_STATE_GET_INFO}; get.subactionPath=rightHandPath; get.action=jumpAction; XrActionStateBoolean b{XR_TYPE_ACTION_STATE_BOOLEAN}; if(XR_SUCCEEDED(xrGetActionStateBoolean(session,&get,&b))&&b.isActive){ if(b.currentState&&!jumpHeld){ jumpHeld=true; state.jump(); } if(!b.currentState) jumpHeld=false; } XrSpaceLocation loc{XR_TYPE_SPACE_LOCATION}; if(aimSpace&&XR_SUCCEEDED(xrLocateSpace(aimSpace,space,time,&loc))&&(loc.locationFlags&XR_SPACE_LOCATION_POSITION_VALID_BIT)&&(loc.locationFlags&XR_SPACE_LOCATION_ORIENTATION_VALID_BIT)) pointer_from_pose(loc.pose); else pointer_from_pose(headPose); }
  void pointer_from_pose(const XrPosef& pose){ Vec3 origin{pose.position.x,pose.position.y,pose.position.z}; Vec3 dir=rotate_vec(pose.orientation,{0,0,-1}); float boardZ=-2.0f; if(std::fabs(dir.z)<0.001f) return; float t=(boardZ-origin.z)/dir.z; if(t<0.05f||t>8.0f) return; state.set_aim(origin.x+dir.x*t, origin.y+dir.y*t); }
  void frame(){ state.tick(1.0f/60.0f); XrFrameState fs{XR_TYPE_FRAME_STATE}; XrFrameWaitInfo wi{XR_TYPE_FRAME_WAIT_INFO}; if(!xr_ok(xrWaitFrame(session,&wi,&fs),"xrWaitFrame")) return; XrFrameBeginInfo bi{XR_TYPE_FRAME_BEGIN_INFO}; xrBeginFrame(session,&bi); std::vector<XrCompositionLayerBaseHeader*> layers; XrCompositionLayerProjection layer{XR_TYPE_COMPOSITION_LAYER_PROJECTION}; if(fs.shouldRender){ XrViewLocateInfo li{XR_TYPE_VIEW_LOCATE_INFO}; li.viewConfigurationType=XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; li.displayTime=fs.predictedDisplayTime; li.space=space; XrViewState vs{XR_TYPE_VIEW_STATE}; uint32_t vc=0; xrLocateViews(session,&li,&vs,(uint32_t)views.size(),&vc,views.data()); if(vc) sync_actions(fs.predictedDisplayTime,views[0].pose); for(uint32_t i=0;i<vc;++i) render_view(i,views[i]); layer.space=space; layer.viewCount=vc; layer.views=projectionViews.data(); layers.push_back(reinterpret_cast<XrCompositionLayerBaseHeader*>(&layer)); } XrFrameEndInfo ei{XR_TYPE_FRAME_END_INFO}; ei.displayTime=fs.predictedDisplayTime; ei.environmentBlendMode=XR_ENVIRONMENT_BLEND_MODE_OPAQUE; ei.layerCount=(uint32_t)layers.size(); ei.layers=layers.empty()?nullptr:layers.data(); xrEndFrame(session,&ei); }
  void rect(float x,float y,float z,float w,float h,Color c,const Mat4& vp){ Mat4 mvp=mul(vp,mul(translate(x,y,z),scale(w,h,1))); glUniformMatrix4fv(glGetUniformLocation(program,"mvp"),1,GL_FALSE,mvp.m); glUniform4f(glGetUniformLocation(program,"col"),c.r,c.g,c.b,c.a); glDrawArrays(GL_TRIANGLES,0,6); }
  void world_rect(const Rect& r,float cam,const Mat4& vp){ rect((r.x-cam)*0.075f,1.02f+r.y*0.075f,-1.98f,r.w*0.075f,r.h*0.075f,r.color,vp); }
  void scene(const XrView& view){ Mat4 vp=mul(projection(view.fov),view_from_pose(view.pose)); glUseProgram(program); glBindBuffer(GL_ARRAY_BUFFER,vbo); glEnableVertexAttribArray(0); glVertexAttribPointer(0,3,GL_FLOAT,GL_FALSE,12,reinterpret_cast<void*>(0)); glEnable(GL_BLEND); glBlendFunc(GL_SRC_ALPHA,GL_ONE_MINUS_SRC_ALPHA); float cam=state.camera_x(); rect(0,1.38f,-2.05f,1.78f,1.08f,{0.04f,0.06f,0.13f,0.96f},vp); rect(0,1.38f,-2.045f,1.90f,1.20f,{0.12f,0.20f,0.40f,0.32f},vp); for(const Rect& r:state.solids) world_rect(r,cam,vp); for(const Rect& r:state.hazards) world_rect(r,cam,vp); float coinX[3]={6.5f,14.5f,23.5f}; float coinY[3]={4.1f,6.1f,4.6f}; for(int i=0;i<3;++i) if(!state.coins[(size_t)i]) rect((coinX[i]-cam)*0.075f,1.02f+coinY[i]*0.075f,-1.97f,0.055f,0.055f,{1.0f,0.78f,0.15f,1},vp); rect((29.5f-cam)*0.075f,1.02f+4.0f*0.075f,-1.97f,0.10f,0.24f,state.score>=3?Color{0.45f,1.0f,0.35f,1}:Color{0.35f,0.45f,0.55f,1},vp); rect((state.playerX-cam)*0.075f,1.02f+(state.playerY+0.55f)*0.075f,-1.96f,0.075f,0.12f,{1,1,1,1},vp); rect(state.aimX,state.aimY,-1.94f,0.035f,0.035f,{0.3f,0.9f,1.0f,0.9f},vp); for(const Bubble& b:state.bubbles) rect(b.x,b.y,-1.93f,b.size,b.size,b.color,vp); }
  void render_view(uint32_t i,const XrView& view){ Swapchain& sw=swapchains[i]; uint32_t img=0; XrSwapchainImageAcquireInfo ai{XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO}; xrAcquireSwapchainImage(sw.handle,&ai,&img); XrSwapchainImageWaitInfo wait{XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO}; wait.timeout=XR_INFINITE_DURATION; xrWaitSwapchainImage(sw.handle,&wait); GLuint fbo; glGenFramebuffers(1,&fbo); glBindFramebuffer(GL_FRAMEBUFFER,fbo); glFramebufferTexture2D(GL_FRAMEBUFFER,GL_COLOR_ATTACHMENT0,GL_TEXTURE_2D,sw.images[img].image,0); glViewport(0,0,sw.width,sw.height); glClearColor(0.015f,0.02f,0.045f,1.0f); glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT); glEnable(GL_DEPTH_TEST); scene(view); glBindFramebuffer(GL_FRAMEBUFFER,0); glDeleteFramebuffers(1,&fbo); projectionViews[i]={XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}; projectionViews[i].pose=view.pose; projectionViews[i].fov=view.fov; projectionViews[i].subImage.swapchain=sw.handle; projectionViews[i].subImage.imageRect.offset={0,0}; projectionViews[i].subImage.imageRect.extent={sw.width,sw.height}; XrSwapchainImageReleaseInfo ri{XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO}; xrReleaseSwapchainImage(sw.handle,&ri); }
  void shutdown(){ if(aimSpace) xrDestroySpace(aimSpace); if(jumpAction) xrDestroyAction(jumpAction); if(aimAction) xrDestroyAction(aimAction); if(actionSet) xrDestroyActionSet(actionSet); for(auto& sw:swapchains) if(sw.handle) xrDestroySwapchain(sw.handle); if(space) xrDestroySpace(space); if(session) xrDestroySession(session); if(instance) xrDestroyInstance(instance); if(program) glDeleteProgram(program); if(vbo) glDeleteBuffers(1,&vbo); if(display!=EGL_NO_DISPLAY){ eglMakeCurrent(display,EGL_NO_SURFACE,EGL_NO_SURFACE,EGL_NO_CONTEXT); if(surface!=EGL_NO_SURFACE) eglDestroySurface(display,surface); if(context!=EGL_NO_CONTEXT) eglDestroyContext(display,context); eglTerminate(display); } }

  android_app* app=nullptr; BubblyPlatformerState state; bool exit=false,running=false,jumpHeld=false; XrInstance instance{XR_NULL_HANDLE}; XrSystemId systemId{XR_NULL_SYSTEM_ID}; XrSession session{XR_NULL_HANDLE}; XrSpace space{XR_NULL_HANDLE}; XrActionSet actionSet{XR_NULL_HANDLE}; XrAction jumpAction{XR_NULL_HANDLE}; XrAction aimAction{XR_NULL_HANDLE}; XrPath rightHandPath{XR_NULL_PATH}; XrSpace aimSpace{XR_NULL_HANDLE}; EGLDisplay display{EGL_NO_DISPLAY}; EGLConfig eglConfig{}; EGLContext context{EGL_NO_CONTEXT}; EGLSurface surface{EGL_NO_SURFACE}; GLuint program=0,vbo=0; std::vector<XrViewConfigurationView> configViews; std::vector<XrView> views; std::vector<Swapchain> swapchains; std::vector<XrCompositionLayerProjectionView> projectionViews;
};

void android_main(android_app* app) { app_dummy(); Host host(app); host.run(); }
