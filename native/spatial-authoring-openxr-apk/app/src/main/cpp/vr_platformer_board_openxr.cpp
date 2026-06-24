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

#define LOG_TAG "VRPlatformerBoardOpenXR"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

struct Color { float r, g, b, a; };
struct Mat4 { float m[16]; };
struct Rect { float x, y, w, h; Color color; };

static float clampf(float v, float lo, float hi) { return std::max(lo, std::min(v, hi)); }
static bool ok(XrResult result, const char* label) { if (XR_FAILED(result)) { LOGE("%s failed: %d", label, result); return false; } return true; }
static XrPosef identityPose() { XrPosef p{}; p.orientation.w = 1.0f; return p; }
static Mat4 identity() { Mat4 r{}; r.m[0] = r.m[5] = r.m[10] = r.m[15] = 1.0f; return r; }
static Mat4 translate(float x, float y, float z) { Mat4 r = identity(); r.m[12] = x; r.m[13] = y; r.m[14] = z; return r; }
static Mat4 scale(float x, float y, float z) { Mat4 r = identity(); r.m[0] = x; r.m[5] = y; r.m[10] = z; return r; }
static Mat4 mul(const Mat4& a, const Mat4& b) { Mat4 r{}; for (int c=0;c<4;++c) for (int row=0;row<4;++row) for (int k=0;k<4;++k) r.m[c*4+row] += a.m[k*4+row] * b.m[c*4+k]; return r; }
static Mat4 projection(const XrFovf& fov) { const float l=std::tan(fov.angleLeft), r=std::tan(fov.angleRight), d=std::tan(fov.angleDown), u=std::tan(fov.angleUp); const float w=r-l, h=u-d, n=0.05f, f=80.0f; Mat4 m{}; m.m[0]=2.0f/w; m.m[5]=2.0f/h; m.m[8]=(r+l)/w; m.m[9]=(u+d)/h; m.m[10]=-(f+n)/(f-n); m.m[11]=-1.0f; m.m[14]=-(2.0f*f*n)/(f-n); return m; }
static Mat4 viewFromPose(const XrPosef& pose) { const XrQuaternionf q=pose.orientation; const float x=-q.x,y=-q.y,z=-q.z,w=q.w; Mat4 r=identity(); r.m[0]=1-2*y*y-2*z*z; r.m[1]=2*x*y+2*w*z; r.m[2]=2*x*z-2*w*y; r.m[4]=2*x*y-2*w*z; r.m[5]=1-2*x*x-2*z*z; r.m[6]=2*y*z+2*w*x; r.m[8]=2*x*z+2*w*y; r.m[9]=2*y*z-2*w*x; r.m[10]=1-2*x*x-2*y*y; return mul(r, translate(-pose.position.x, -pose.position.y, -pose.position.z)); }

class PlatformerBoardState {
public:
  float playerX = 1.5f, playerY = 1.0f, velX = 0.0f, velY = 0.0f;
  float axisX = 0.0f;
  bool grounded = true;
  int score = 0;
  unsigned long long frame = 0;
  std::vector<int> coins{0,0,0};
  std::vector<Rect> solids;
  std::vector<Rect> hazards;

  void reset() {
    playerX = 1.5f; playerY = 1.0f; velX = velY = 0.0f; grounded = true; score = 0; coins = {0,0,0}; frame = 0;
    solids = {{0,0,32,1,{0.38f,0.56f,1.0f,1}}, {5,3,5,0.5f,{0.38f,0.56f,1,1}}, {13,5,4,0.5f,{0.38f,0.56f,1,1}}, {21,3.5f,6,0.5f,{0.38f,0.56f,1,1}}};
    hazards = {{10.5f,0.95f,2,0.25f,{1.0f,0.16f,0.32f,1}}};
    LOGI("VR Platformer Board reset: platformer-level-domain-kit, platformer-avatar-domain-kit, spatial-game-board-domain-kit");
  }
  void setAxis(float x) { axisX = clampf(x, -1.0f, 1.0f); }
  void jump() { if (grounded) { velY = 13.0f; grounded = false; LOGI("platformer-avatar-domain-kit: jump requested"); } }
  void tick(float dt) {
    frame++;
    const float accel = 35.0f, maxSpeed = 7.0f, friction = 18.0f, gravity = -32.0f;
    if (std::fabs(axisX) > 0.02f) velX = clampf(velX + axisX * accel * dt, -maxSpeed, maxSpeed);
    else velX = std::fabs(velX) < friction * dt ? 0.0f : velX - std::copysign(friction * dt, velX);
    velY = std::max(-28.0f, velY + gravity * dt);
    const float prevY = playerY;
    playerX += velX * dt;
    playerY += velY * dt;
    grounded = false;
    for (const Rect& s : solids) {
      const bool overlapX = playerX + 0.35f > s.x && playerX < s.x + s.w;
      const bool hitTop = prevY >= s.y + s.h - 0.05f && playerY <= s.y + s.h && overlapX && velY <= 0.0f;
      if (hitTop) { playerY = s.y + s.h; velY = 0.0f; grounded = true; }
    }
    const float coinX[3] = {6.5f,14.5f,23.5f}; const float coinY[3] = {4.1f,6.1f,4.6f};
    for (int i=0;i<3;++i) if (!coins[(size_t)i] && std::fabs(playerX-coinX[i])<0.55f && std::fabs(playerY-coinY[i])<0.75f) { coins[(size_t)i]=1; score++; LOGI("platformer-object-domain-kit: coin-%d collected score=%d", i+1, score); }
    for (const Rect& h : hazards) if (playerX + 0.35f > h.x && playerX < h.x + h.w && playerY < 1.45f) { LOGI("platformer-object-domain-kit: hazard triggered reset"); reset(); return; }
    if (playerY < -4.0f) { LOGI("platformer-objective-sequence-kit: fallen reset"); reset(); return; }
    if (playerX > 29.0f && score >= 3) { LOGI("platformer-objective-sequence-kit: level complete"); reset(); return; }
  }
};

class Host {
public:
  explicit Host(android_app* a) : app(a) {}
  void run() {
    app->userData = this;
    app->onAppCmd = [](android_app* a, int32_t cmd){ if (cmd == APP_CMD_DESTROY) static_cast<Host*>(a->userData)->exit = true; };
    app->onInputEvent = [](android_app* a, AInputEvent* e)->int32_t { return static_cast<Host*>(a->userData)->onInput(e); };
    game.reset();
    if (!init()) LOGE("OpenXR init failed for VR Platformer Board");
    while (!exit && !app->destroyRequested) { int events=0; android_poll_source* src=nullptr; while (ALooper_pollOnce(running?0:100, nullptr, &events, reinterpret_cast<void**>(&src)) >= 0) { if (src) src->process(app, src); if (app->destroyRequested) exit = true; } pollEvents(); if (running) frame(); }
    shutdown();
  }
private:
  struct Swapchain { XrSwapchain handle{XR_NULL_HANDLE}; int32_t width{0}, height{0}; std::vector<XrSwapchainImageOpenGLESKHR> images; };
  int32_t onInput(AInputEvent* event) {
    if (AInputEvent_getType(event) == AINPUT_EVENT_TYPE_KEY) { int action=AKeyEvent_getAction(event), key=AKeyEvent_getKeyCode(event); if (action==AKEY_EVENT_ACTION_DOWN) { if (key==AKEYCODE_BUTTON_A || key==AKEYCODE_SPACE || key==AKEYCODE_DPAD_UP) game.jump(); if (key==AKEYCODE_BACK || key==AKEYCODE_BUTTON_B) game.reset(); return 1; } }
    if (AInputEvent_getType(event) == AINPUT_EVENT_TYPE_MOTION) { float x=AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_X, 0); float hat=AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_HAT_X, 0); if (std::fabs(hat)>std::fabs(x)) x=hat; game.setAxis(x); float rt=std::max(AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_RTRIGGER,0), AMotionEvent_getAxisValue(event, AMOTION_EVENT_AXIS_GAS,0)); if (rt>0.2f && !triggerDown) { triggerDown=true; game.jump(); } if (rt<=0.2f) triggerDown=false; return 1; }
    return 0;
  }
  bool init(){ return initLoader() && createInstance() && createActions() && getSystem() && initEgl() && createProgram() && createSession() && attachActions() && createSpaces() && createSwapchains(); }
  bool initLoader(){ PFN_xrInitializeLoaderKHR fn=nullptr; xrGetInstanceProcAddr(XR_NULL_HANDLE,"xrInitializeLoaderKHR",reinterpret_cast<PFN_xrVoidFunction*>(&fn)); if(!fn) return true; XrLoaderInitInfoAndroidKHR info{XR_TYPE_LOADER_INIT_INFO_ANDROID_KHR}; info.applicationVM=app->activity->vm; info.applicationContext=app->activity->clazz; return ok(fn(reinterpret_cast<XrLoaderInitInfoBaseHeaderKHR*>(&info)),"xrInitializeLoaderKHR"); }
  bool createInstance(){ const char* exts[]={XR_KHR_ANDROID_CREATE_INSTANCE_EXTENSION_NAME,XR_KHR_OPENGL_ES_ENABLE_EXTENSION_NAME}; XrInstanceCreateInfoAndroidKHR ai{XR_TYPE_INSTANCE_CREATE_INFO_ANDROID_KHR}; ai.applicationVM=app->activity->vm; ai.applicationActivity=app->activity->clazz; XrInstanceCreateInfo ci{XR_TYPE_INSTANCE_CREATE_INFO}; ci.next=&ai; ci.enabledExtensionCount=2; ci.enabledExtensionNames=exts; std::strncpy(ci.applicationInfo.applicationName,"VR Platformer Board",XR_MAX_APPLICATION_NAME_SIZE-1); std::strncpy(ci.applicationInfo.engineName,"NexusRealtime",XR_MAX_ENGINE_NAME_SIZE-1); ci.applicationInfo.apiVersion=XR_CURRENT_API_VERSION; return ok(xrCreateInstance(&ci,&instance),"xrCreateInstance"); }
  bool createActions(){ XrActionSetCreateInfo si{XR_TYPE_ACTION_SET_CREATE_INFO}; std::strncpy(si.actionSetName,"vr_platformer",XR_MAX_ACTION_SET_NAME_SIZE-1); std::strncpy(si.localizedActionSetName,"VR Platformer",XR_MAX_LOCALIZED_ACTION_SET_NAME_SIZE-1); if(!ok(xrCreateActionSet(instance,&si,&actionSet),"xrCreateActionSet")) return false; xrStringToPath(instance,"/user/hand/right",&rightHandPath); XrActionCreateInfo a{XR_TYPE_ACTION_CREATE_INFO}; a.countSubactionPaths=1; a.subactionPaths=&rightHandPath; a.actionType=XR_ACTION_TYPE_BOOLEAN_INPUT; std::strncpy(a.actionName,"jump",XR_MAX_ACTION_NAME_SIZE-1); std::strncpy(a.localizedActionName,"Jump",XR_MAX_LOCALIZED_ACTION_NAME_SIZE-1); xrCreateAction(actionSet,&a,&jumpAction); a.actionType=XR_ACTION_TYPE_POSE_INPUT; std::strncpy(a.actionName,"right_aim",XR_MAX_ACTION_NAME_SIZE-1); std::strncpy(a.localizedActionName,"Right Aim",XR_MAX_LOCALIZED_ACTION_NAME_SIZE-1); xrCreateAction(actionSet,&a,&aimAction); return true; }
  bool getSystem(){ XrSystemGetInfo info{XR_TYPE_SYSTEM_GET_INFO}; info.formFactor=XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY; return ok(xrGetSystem(instance,&info,&systemId),"xrGetSystem"); }
  bool initEgl(){ display=eglGetDisplay(EGL_DEFAULT_DISPLAY); if(display==EGL_NO_DISPLAY||!eglInitialize(display,nullptr,nullptr)) return false; const EGLint attrs[]={EGL_RENDERABLE_TYPE,EGL_OPENGL_ES3_BIT,EGL_SURFACE_TYPE,EGL_PBUFFER_BIT,EGL_RED_SIZE,8,EGL_GREEN_SIZE,8,EGL_BLUE_SIZE,8,EGL_ALPHA_SIZE,8,EGL_DEPTH_SIZE,16,EGL_NONE}; EGLint n=0; if(!eglChooseConfig(display,attrs,&eglConfig,1,&n)||n<1) return false; const EGLint ca[]={EGL_CONTEXT_CLIENT_VERSION,3,EGL_NONE}; context=eglCreateContext(display,eglConfig,EGL_NO_CONTEXT,ca); const EGLint sa[]={EGL_WIDTH,16,EGL_HEIGHT,16,EGL_NONE}; surface=eglCreatePbufferSurface(display,eglConfig,sa); return context!=EGL_NO_CONTEXT&&surface!=EGL_NO_SURFACE&&eglMakeCurrent(display,surface,surface,context); }
  GLuint shader(GLenum type,const char* src){ GLuint s=glCreateShader(type); glShaderSource(s,1,&src,nullptr); glCompileShader(s); return s; }
  bool createProgram(){ const char* vs="#version 300 es\nlayout(location=0)in vec3 p;uniform mat4 mvp;void main(){gl_Position=mvp*vec4(p,1.0);}"; const char* fs="#version 300 es\nprecision mediump float;uniform vec4 col;out vec4 o;void main(){o=col;}"; GLuint v=shader(GL_VERTEX_SHADER,vs), f=shader(GL_FRAGMENT_SHADER,fs); program=glCreateProgram(); glAttachShader(program,v); glAttachShader(program,f); glLinkProgram(program); glDeleteShader(v); glDeleteShader(f); float quad[]={-0.5f,-0.5f,0, .5f,-0.5f,0, .5f,.5f,0, -0.5f,-0.5f,0, .5f,.5f,0, -0.5f,.5f,0}; glGenBuffers(1,&vbo); glBindBuffer(GL_ARRAY_BUFFER,vbo); glBufferData(GL_ARRAY_BUFFER,sizeof(quad),quad,GL_STATIC_DRAW); return true; }
  bool createSession(){ PFN_xrGetOpenGLESGraphicsRequirementsKHR req=nullptr; xrGetInstanceProcAddr(instance,"xrGetOpenGLESGraphicsRequirementsKHR",reinterpret_cast<PFN_xrVoidFunction*>(&req)); if(!req) return false; XrGraphicsRequirementsOpenGLESKHR gr{XR_TYPE_GRAPHICS_REQUIREMENTS_OPENGL_ES_KHR}; req(instance,systemId,&gr); XrGraphicsBindingOpenGLESAndroidKHR b{XR_TYPE_GRAPHICS_BINDING_OPENGL_ES_ANDROID_KHR}; b.display=display; b.config=eglConfig; b.context=context; XrSessionCreateInfo ci{XR_TYPE_SESSION_CREATE_INFO}; ci.next=&b; ci.systemId=systemId; return ok(xrCreateSession(instance,&ci,&session),"xrCreateSession"); }
  bool attachActions(){ XrSessionActionSetsAttachInfo ai{XR_TYPE_SESSION_ACTION_SETS_ATTACH_INFO}; ai.countActionSets=1; ai.actionSets=&actionSet; return ok(xrAttachSessionActionSets(session,&ai),"xrAttachSessionActionSets"); }
  bool createSpaces(){ XrReferenceSpaceCreateInfo ri{XR_TYPE_REFERENCE_SPACE_CREATE_INFO}; ri.referenceSpaceType=XR_REFERENCE_SPACE_TYPE_LOCAL; ri.poseInReferenceSpace=identityPose(); if(!ok(xrCreateReferenceSpace(session,&ri,&space),"xrCreateReferenceSpace")) return false; XrActionSpaceCreateInfo ai{XR_TYPE_ACTION_SPACE_CREATE_INFO}; ai.action=aimAction; ai.subactionPath=rightHandPath; ai.poseInActionSpace=identityPose(); xrCreateActionSpace(session,&ai,&aimSpace); return true; }
  int64_t chooseFormat(){ uint32_t c=0; xrEnumerateSwapchainFormats(session,0,&c,nullptr); std::vector<int64_t> fs(c); if(c) xrEnumerateSwapchainFormats(session,c,&c,fs.data()); return fs.empty()?GL_RGBA8:fs[0]; }
  bool createSwapchains(){ uint32_t c=0; xrEnumerateViewConfigurationViews(instance,systemId,XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,0,&c,nullptr); configViews.resize(c,{XR_TYPE_VIEW_CONFIGURATION_VIEW}); xrEnumerateViewConfigurationViews(instance,systemId,XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO,c,&c,configViews.data()); views.resize(c,{XR_TYPE_VIEW}); swapchains.resize(c); projectionViews.resize(c,{XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}); int64_t fmt=chooseFormat(); for(uint32_t i=0;i<c;++i){ XrSwapchainCreateInfo si{XR_TYPE_SWAPCHAIN_CREATE_INFO}; si.usageFlags=XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT; si.format=fmt; si.sampleCount=configViews[i].recommendedSwapchainSampleCount; si.width=configViews[i].recommendedImageRectWidth; si.height=configViews[i].recommendedImageRectHeight; si.faceCount=1; si.arraySize=1; si.mipCount=1; if(!ok(xrCreateSwapchain(session,&si,&swapchains[i].handle),"xrCreateSwapchain")) return false; swapchains[i].width=si.width; swapchains[i].height=si.height; uint32_t ic=0; xrEnumerateSwapchainImages(swapchains[i].handle,0,&ic,nullptr); swapchains[i].images.resize(ic,{XR_TYPE_SWAPCHAIN_IMAGE_OPENGL_ES_KHR}); xrEnumerateSwapchainImages(swapchains[i].handle,ic,&ic,reinterpret_cast<XrSwapchainImageBaseHeader*>(swapchains[i].images.data())); } return true; }
  void pollEvents(){ XrEventDataBuffer e{XR_TYPE_EVENT_DATA_BUFFER}; while(instance && xrPollEvent(instance,&e)==XR_SUCCESS){ if(e.type==XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED){ auto* s=reinterpret_cast<XrEventDataSessionStateChanged*>(&e); if(s->state==XR_SESSION_STATE_READY){ XrSessionBeginInfo bi{XR_TYPE_SESSION_BEGIN_INFO}; bi.primaryViewConfigurationType=XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; if(ok(xrBeginSession(session,&bi),"xrBeginSession")) running=true; } else if(s->state==XR_SESSION_STATE_STOPPING){ xrEndSession(session); running=false; } else if(s->state==XR_SESSION_STATE_EXITING||s->state==XR_SESSION_STATE_LOSS_PENDING) exit=true; } e={XR_TYPE_EVENT_DATA_BUFFER}; } }
  void syncActions(){ XrActiveActionSet active{actionSet,XR_NULL_PATH}; XrActionsSyncInfo sync{XR_TYPE_ACTIONS_SYNC_INFO}; sync.countActiveActionSets=1; sync.activeActionSets=&active; xrSyncActions(session,&sync); XrActionStateGetInfo get{XR_TYPE_ACTION_STATE_GET_INFO}; get.subactionPath=rightHandPath; get.action=jumpAction; XrActionStateBoolean b{XR_TYPE_ACTION_STATE_BOOLEAN}; if(XR_SUCCEEDED(xrGetActionStateBoolean(session,&get,&b))&&b.isActive){ if(b.currentState&&!triggerDown){ triggerDown=true; game.jump(); } if(!b.currentState) triggerDown=false; } }
  void frame(){ game.tick(1.0f/60.0f); XrFrameState fs{XR_TYPE_FRAME_STATE}; XrFrameWaitInfo wi{XR_TYPE_FRAME_WAIT_INFO}; if(!ok(xrWaitFrame(session,&wi,&fs),"xrWaitFrame")) return; XrFrameBeginInfo bi{XR_TYPE_FRAME_BEGIN_INFO}; xrBeginFrame(session,&bi); std::vector<XrCompositionLayerBaseHeader*> layers; XrCompositionLayerProjection layer{XR_TYPE_COMPOSITION_LAYER_PROJECTION}; if(fs.shouldRender){ XrViewLocateInfo li{XR_TYPE_VIEW_LOCATE_INFO}; li.viewConfigurationType=XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO; li.displayTime=fs.predictedDisplayTime; li.space=space; XrViewState vs{XR_TYPE_VIEW_STATE}; uint32_t vc=0; xrLocateViews(session,&li,&vs,(uint32_t)views.size(),&vc,views.data()); syncActions(); for(uint32_t i=0;i<vc;++i) renderView(i,views[i]); layer.space=space; layer.viewCount=vc; layer.views=projectionViews.data(); layers.push_back(reinterpret_cast<XrCompositionLayerBaseHeader*>(&layer)); } XrFrameEndInfo ei{XR_TYPE_FRAME_END_INFO}; ei.displayTime=fs.predictedDisplayTime; ei.environmentBlendMode=XR_ENVIRONMENT_BLEND_MODE_OPAQUE; ei.layerCount=(uint32_t)layers.size(); ei.layers=layers.empty()?nullptr:layers.data(); xrEndFrame(session,&ei); }
  void drawRect(float x,float y,float z,float w,float h,Color c,const Mat4& vp){ Mat4 mvp=mul(vp,mul(translate(x,y,z),scale(w,h,1))); glUniformMatrix4fv(glGetUniformLocation(program,"mvp"),1,GL_FALSE,mvp.m); glUniform4f(glGetUniformLocation(program,"col"),c.r,c.g,c.b,c.a); glDrawArrays(GL_TRIANGLES,0,6); }
  void drawWorldRect(const Rect& r,float cam,const Mat4& vp){ float bx=(r.x-cam)*0.075f; float by=0.92f+r.y*0.075f; drawRect(bx,by,-2.0f,r.w*0.075f,r.h*0.075f,r.color,vp); }
  void drawScene(const XrView& view){ Mat4 vp=mul(projection(view.fov),viewFromPose(view.pose)); glUseProgram(program); glBindBuffer(GL_ARRAY_BUFFER,vbo); glEnableVertexAttribArray(0); glVertexAttribPointer(0,3,GL_FLOAT,GL_FALSE,12,reinterpret_cast<void*>(0)); glEnable(GL_BLEND); glBlendFunc(GL_SRC_ALPHA,GL_ONE_MINUS_SRC_ALPHA); float cam=clampf(game.playerX-8.0f,0.0f,22.0f); drawRect(0,1.35f,-2.04f,1.72f,1.02f,{0.04f,0.07f,0.14f,0.95f},vp); drawRect(0,1.35f,-2.045f,1.82f,1.12f,{0.10f,0.18f,0.36f,0.35f},vp); for(const Rect& r:game.solids) drawWorldRect(r,cam,vp); for(const Rect& r:game.hazards) drawWorldRect(r,cam,vp); float cx[3]={6.5f,14.5f,23.5f}; float cy[3]={4.1f,6.1f,4.6f}; for(int i=0;i<3;++i) if(!game.coins[(size_t)i]) drawRect((cx[i]-cam)*0.075f,0.92f+cy[i]*0.075f,-1.98f,0.055f,0.055f,{1.0f,0.78f,0.15f,1},vp); drawRect((29.5f-cam)*0.075f,0.92f+4.0f*0.075f,-1.99f,0.10f,0.24f,game.score>=3?Color{0.45f,1.0f,0.35f,1}:Color{0.35f,0.45f,0.55f,1},vp); drawRect((game.playerX-cam)*0.075f,0.92f+(game.playerY+0.55f)*0.075f,-1.96f,0.075f,0.12f,{1,1,1,1},vp); for(int i=0;i<game.score;++i) drawRect(-0.78f+i*0.07f,1.84f,-1.95f,0.04f,0.04f,{1.0f,0.78f,0.15f,1},vp); }
  void renderView(uint32_t i,const XrView& view){ Swapchain& sw=swapchains[i]; uint32_t img=0; XrSwapchainImageAcquireInfo ai{XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO}; xrAcquireSwapchainImage(sw.handle,&ai,&img); XrSwapchainImageWaitInfo wait{XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO}; wait.timeout=XR_INFINITE_DURATION; xrWaitSwapchainImage(sw.handle,&wait); GLuint fbo; glGenFramebuffers(1,&fbo); glBindFramebuffer(GL_FRAMEBUFFER,fbo); glFramebufferTexture2D(GL_FRAMEBUFFER,GL_COLOR_ATTACHMENT0,GL_TEXTURE_2D,sw.images[img].image,0); glViewport(0,0,sw.width,sw.height); glClearColor(0.02f,0.03f,0.07f,1.0f); glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT); glEnable(GL_DEPTH_TEST); drawScene(view); glBindFramebuffer(GL_FRAMEBUFFER,0); glDeleteFramebuffers(1,&fbo); projectionViews[i]={XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW}; projectionViews[i].pose=view.pose; projectionViews[i].fov=view.fov; projectionViews[i].subImage.swapchain=sw.handle; projectionViews[i].subImage.imageRect.offset={0,0}; projectionViews[i].subImage.imageRect.extent={sw.width,sw.height}; XrSwapchainImageReleaseInfo ri{XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO}; xrReleaseSwapchainImage(sw.handle,&ri); }
  void shutdown(){ if(aimSpace) xrDestroySpace(aimSpace); if(jumpAction) xrDestroyAction(jumpAction); if(aimAction) xrDestroyAction(aimAction); if(actionSet) xrDestroyActionSet(actionSet); for(auto& sw:swapchains) if(sw.handle) xrDestroySwapchain(sw.handle); if(space) xrDestroySpace(space); if(session) xrDestroySession(session); if(instance) xrDestroyInstance(instance); if(program) glDeleteProgram(program); if(vbo) glDeleteBuffers(1,&vbo); if(display!=EGL_NO_DISPLAY){ eglMakeCurrent(display,EGL_NO_SURFACE,EGL_NO_SURFACE,EGL_NO_CONTEXT); if(surface!=EGL_NO_SURFACE) eglDestroySurface(display,surface); if(context!=EGL_NO_CONTEXT) eglDestroyContext(display,context); eglTerminate(display); } }
  android_app* app=nullptr; PlatformerBoardState game; bool exit=false,running=false,triggerDown=false; XrInstance instance{XR_NULL_HANDLE}; XrSystemId systemId{XR_NULL_SYSTEM_ID}; XrSession session{XR_NULL_HANDLE}; XrSpace space{XR_NULL_HANDLE}; XrActionSet actionSet{XR_NULL_HANDLE}; XrAction jumpAction{XR_NULL_HANDLE}; XrAction aimAction{XR_NULL_HANDLE}; XrPath rightHandPath{XR_NULL_PATH}; XrSpace aimSpace{XR_NULL_HANDLE}; EGLDisplay display{EGL_NO_DISPLAY}; EGLConfig eglConfig{}; EGLContext context{EGL_NO_CONTEXT}; EGLSurface surface{EGL_NO_SURFACE}; GLuint program=0,vbo=0; std::vector<XrViewConfigurationView> configViews; std::vector<XrView> views; std::vector<Swapchain> swapchains; std::vector<XrCompositionLayerProjectionView> projectionViews;
};

void android_main(android_app* app) { app_dummy(); Host host(app); host.run(); }
