#include <android/log.h>
#include <android_native_app_glue.h>

#include <EGL/egl.h>
#include <GLES3/gl3.h>

#include <openxr/openxr.h>
#include <openxr/openxr_platform.h>

#include <array>
#include <cstring>
#include <string>
#include <vector>

#define LOG_TAG "SeedSpatialOpenXR"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

static XrPosef IdentityPose() {
    XrPosef pose{};
    pose.orientation.w = 1.0f;
    return pose;
}

static bool CheckXr(XrResult result, const char* label) {
    if (XR_FAILED(result)) {
        LOGE("%s failed with XrResult %d", label, result);
        return false;
    }
    return true;
}

class SeedSpatialOpenXRApp {
public:
    explicit SeedSpatialOpenXRApp(android_app* app) : app_(app) {}

    void Run() {
        app_->userData = this;
        app_->onAppCmd = [](android_app* app, int32_t cmd) {
            auto* self = static_cast<SeedSpatialOpenXRApp*>(app->userData);
            if (cmd == APP_CMD_DESTROY) self->exitRequested_ = true;
        };

        if (!InitOpenXR()) {
            LOGE("OpenXR init failed. App will remain idle.");
        }

        while (!exitRequested_ && !app_->destroyRequested) {
            int events = 0;
            android_poll_source* source = nullptr;
            while (ALooper_pollOnce(sessionRunning_ ? 0 : 100, nullptr, &events, reinterpret_cast<void**>(&source)) >= 0) {
                if (source) source->process(app_, source);
                if (app_->destroyRequested) exitRequested_ = true;
            }
            PollXrEvents();
            if (sessionRunning_) RenderFrame();
        }
        Shutdown();
    }

private:
    struct ViewSwapchain {
        XrSwapchain handle{XR_NULL_HANDLE};
        int32_t width{0};
        int32_t height{0};
        std::vector<XrSwapchainImageOpenGLESKHR> images;
    };

    bool InitOpenXR() {
        if (!InitLoader()) return false;
        if (!CreateInstance()) return false;
        if (!GetSystem()) return false;
        if (!InitEgl()) return false;
        if (!CreateSession()) return false;
        if (!CreateReferenceSpace()) return false;
        if (!CreateSwapchains()) return false;
        LOGI("SeedSpatial native OpenXR shell initialized.");
        return true;
    }

    bool InitLoader() {
        PFN_xrInitializeLoaderKHR initializeLoader = nullptr;
        xrGetInstanceProcAddr(XR_NULL_HANDLE, "xrInitializeLoaderKHR", reinterpret_cast<PFN_xrVoidFunction*>(&initializeLoader));
        if (!initializeLoader) {
            LOGI("xrInitializeLoaderKHR unavailable; continuing for runtimes that do not require explicit loader init.");
            return true;
        }
        XrLoaderInitInfoAndroidKHR initInfo{XR_TYPE_LOADER_INIT_INFO_ANDROID_KHR};
        initInfo.applicationVM = app_->activity->vm;
        initInfo.applicationContext = app_->activity->clazz;
        return CheckXr(initializeLoader(reinterpret_cast<XrLoaderInitInfoBaseHeaderKHR*>(&initInfo)), "xrInitializeLoaderKHR");
    }

    bool ExtensionSupported(const char* name, const std::vector<XrExtensionProperties>& extensions) {
        for (const auto& ext : extensions) if (std::strcmp(ext.extensionName, name) == 0) return true;
        return false;
    }

    bool CreateInstance() {
        uint32_t extensionCount = 0;
        xrEnumerateInstanceExtensionProperties(nullptr, 0, &extensionCount, nullptr);
        std::vector<XrExtensionProperties> extensions(extensionCount, {XR_TYPE_EXTENSION_PROPERTIES});
        xrEnumerateInstanceExtensionProperties(nullptr, extensionCount, &extensionCount, extensions.data());

        std::vector<const char*> enabled;
        enabled.push_back(XR_KHR_ANDROID_CREATE_INSTANCE_EXTENSION_NAME);
        enabled.push_back(XR_KHR_OPENGL_ES_ENABLE_EXTENSION_NAME);
        if (ExtensionSupported(XR_EXT_HAND_TRACKING_EXTENSION_NAME, extensions)) {
            enabled.push_back(XR_EXT_HAND_TRACKING_EXTENSION_NAME);
            handTrackingAvailable_ = true;
        }

        XrInstanceCreateInfoAndroidKHR androidInfo{XR_TYPE_INSTANCE_CREATE_INFO_ANDROID_KHR};
        androidInfo.applicationVM = app_->activity->vm;
        androidInfo.applicationActivity = app_->activity->clazz;

        XrInstanceCreateInfo createInfo{XR_TYPE_INSTANCE_CREATE_INFO};
        createInfo.next = &androidInfo;
        createInfo.enabledExtensionCount = static_cast<uint32_t>(enabled.size());
        createInfo.enabledExtensionNames = enabled.data();
        std::strncpy(createInfo.applicationInfo.applicationName, "SeedSpatial OpenXR", XR_MAX_APPLICATION_NAME_SIZE - 1);
        createInfo.applicationInfo.applicationVersion = 1;
        std::strncpy(createInfo.applicationInfo.engineName, "NexusRealtime", XR_MAX_ENGINE_NAME_SIZE - 1);
        createInfo.applicationInfo.engineVersion = 1;
        createInfo.applicationInfo.apiVersion = XR_CURRENT_API_VERSION;
        return CheckXr(xrCreateInstance(&createInfo, &instance_), "xrCreateInstance");
    }

    bool GetSystem() {
        XrSystemGetInfo systemInfo{XR_TYPE_SYSTEM_GET_INFO};
        systemInfo.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY;
        return CheckXr(xrGetSystem(instance_, &systemInfo, &systemId_), "xrGetSystem");
    }

    bool InitEgl() {
        display_ = eglGetDisplay(EGL_DEFAULT_DISPLAY);
        if (display_ == EGL_NO_DISPLAY) return false;
        if (!eglInitialize(display_, nullptr, nullptr)) return false;

        const EGLint configAttribs[] = {
            EGL_RENDERABLE_TYPE, EGL_OPENGL_ES3_BIT,
            EGL_SURFACE_TYPE, EGL_PBUFFER_BIT,
            EGL_RED_SIZE, 8, EGL_GREEN_SIZE, 8, EGL_BLUE_SIZE, 8, EGL_ALPHA_SIZE, 8,
            EGL_DEPTH_SIZE, 0,
            EGL_NONE
        };
        EGLint numConfigs = 0;
        if (!eglChooseConfig(display_, configAttribs, &config_, 1, &numConfigs) || numConfigs < 1) return false;

        const EGLint contextAttribs[] = { EGL_CONTEXT_CLIENT_VERSION, 3, EGL_NONE };
        context_ = eglCreateContext(display_, config_, EGL_NO_CONTEXT, contextAttribs);
        if (context_ == EGL_NO_CONTEXT) return false;
        const EGLint pbufferAttribs[] = { EGL_WIDTH, 16, EGL_HEIGHT, 16, EGL_NONE };
        surface_ = eglCreatePbufferSurface(display_, config_, pbufferAttribs);
        if (surface_ == EGL_NO_SURFACE) return false;
        return eglMakeCurrent(display_, surface_, surface_, context_);
    }

    bool CreateSession() {
        PFN_xrGetOpenGLESGraphicsRequirementsKHR getRequirements = nullptr;
        xrGetInstanceProcAddr(instance_, "xrGetOpenGLESGraphicsRequirementsKHR", reinterpret_cast<PFN_xrVoidFunction*>(&getRequirements));
        if (!getRequirements) return false;
        XrGraphicsRequirementsOpenGLESKHR requirements{XR_TYPE_GRAPHICS_REQUIREMENTS_OPENGL_ES_KHR};
        if (!CheckXr(getRequirements(instance_, systemId_, &requirements), "xrGetOpenGLESGraphicsRequirementsKHR")) return false;

        XrGraphicsBindingOpenGLESAndroidKHR binding{XR_TYPE_GRAPHICS_BINDING_OPENGL_ES_ANDROID_KHR};
        binding.display = display_;
        binding.config = config_;
        binding.context = context_;

        XrSessionCreateInfo sessionInfo{XR_TYPE_SESSION_CREATE_INFO};
        sessionInfo.next = &binding;
        sessionInfo.systemId = systemId_;
        return CheckXr(xrCreateSession(instance_, &sessionInfo, &session_), "xrCreateSession");
    }

    bool CreateReferenceSpace() {
        XrReferenceSpaceCreateInfo spaceInfo{XR_TYPE_REFERENCE_SPACE_CREATE_INFO};
        spaceInfo.referenceSpaceType = XR_REFERENCE_SPACE_TYPE_LOCAL;
        spaceInfo.poseInReferenceSpace = IdentityPose();
        return CheckXr(xrCreateReferenceSpace(session_, &spaceInfo, &appSpace_), "xrCreateReferenceSpace");
    }

    int64_t ChooseColorFormat() {
        uint32_t count = 0;
        xrEnumerateSwapchainFormats(session_, 0, &count, nullptr);
        std::vector<int64_t> formats(count);
        xrEnumerateSwapchainFormats(session_, count, &count, formats.data());
        for (int64_t f : formats) if (f == GL_SRGB8_ALPHA8) return f;
        for (int64_t f : formats) if (f == GL_RGBA8) return f;
        return formats.empty() ? GL_RGBA8 : formats[0];
    }

    bool CreateSwapchains() {
        uint32_t viewCount = 0;
        xrEnumerateViewConfigurationViews(instance_, systemId_, XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, 0, &viewCount, nullptr);
        configViews_.resize(viewCount, {XR_TYPE_VIEW_CONFIGURATION_VIEW});
        xrEnumerateViewConfigurationViews(instance_, systemId_, XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO, viewCount, &viewCount, configViews_.data());
        views_.resize(viewCount, {XR_TYPE_VIEW});
        swapchains_.resize(viewCount);
        projectionViews_.resize(viewCount, {XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW});

        const int64_t colorFormat = ChooseColorFormat();
        for (uint32_t i = 0; i < viewCount; ++i) {
            XrSwapchainCreateInfo createInfo{XR_TYPE_SWAPCHAIN_CREATE_INFO};
            createInfo.usageFlags = XR_SWAPCHAIN_USAGE_COLOR_ATTACHMENT_BIT;
            createInfo.format = colorFormat;
            createInfo.sampleCount = configViews_[i].recommendedSwapchainSampleCount;
            createInfo.width = configViews_[i].recommendedImageRectWidth;
            createInfo.height = configViews_[i].recommendedImageRectHeight;
            createInfo.faceCount = 1;
            createInfo.arraySize = 1;
            createInfo.mipCount = 1;
            if (!CheckXr(xrCreateSwapchain(session_, &createInfo, &swapchains_[i].handle), "xrCreateSwapchain")) return false;
            swapchains_[i].width = static_cast<int32_t>(createInfo.width);
            swapchains_[i].height = static_cast<int32_t>(createInfo.height);
            uint32_t imageCount = 0;
            xrEnumerateSwapchainImages(swapchains_[i].handle, 0, &imageCount, nullptr);
            swapchains_[i].images.resize(imageCount, {XR_TYPE_SWAPCHAIN_IMAGE_OPENGL_ES_KHR});
            xrEnumerateSwapchainImages(swapchains_[i].handle, imageCount, &imageCount, reinterpret_cast<XrSwapchainImageBaseHeader*>(swapchains_[i].images.data()));
        }
        return true;
    }

    void PollXrEvents() {
        if (instance_ == XR_NULL_HANDLE) return;
        XrEventDataBuffer event{XR_TYPE_EVENT_DATA_BUFFER};
        while (xrPollEvent(instance_, &event) == XR_SUCCESS) {
            switch (event.type) {
                case XR_TYPE_EVENT_DATA_SESSION_STATE_CHANGED: {
                    auto* changed = reinterpret_cast<XrEventDataSessionStateChanged*>(&event);
                    sessionState_ = changed->state;
                    if (sessionState_ == XR_SESSION_STATE_READY) {
                        XrSessionBeginInfo beginInfo{XR_TYPE_SESSION_BEGIN_INFO};
                        beginInfo.primaryViewConfigurationType = XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO;
                        if (CheckXr(xrBeginSession(session_, &beginInfo), "xrBeginSession")) sessionRunning_ = true;
                    } else if (sessionState_ == XR_SESSION_STATE_STOPPING) {
                        xrEndSession(session_);
                        sessionRunning_ = false;
                    } else if (sessionState_ == XR_SESSION_STATE_EXITING || sessionState_ == XR_SESSION_STATE_LOSS_PENDING) {
                        exitRequested_ = true;
                    }
                    break;
                }
                default: break;
            }
            event = {XR_TYPE_EVENT_DATA_BUFFER};
        }
    }

    void RenderFrame() {
        XrFrameState frameState{XR_TYPE_FRAME_STATE};
        XrFrameWaitInfo waitInfo{XR_TYPE_FRAME_WAIT_INFO};
        if (!CheckXr(xrWaitFrame(session_, &waitInfo, &frameState), "xrWaitFrame")) return;
        XrFrameBeginInfo beginInfo{XR_TYPE_FRAME_BEGIN_INFO};
        xrBeginFrame(session_, &beginInfo);

        std::vector<XrCompositionLayerBaseHeader*> layers;
        XrCompositionLayerProjection layer{XR_TYPE_COMPOSITION_LAYER_PROJECTION};

        if (frameState.shouldRender) {
            XrViewLocateInfo locateInfo{XR_TYPE_VIEW_LOCATE_INFO};
            locateInfo.viewConfigurationType = XR_VIEW_CONFIGURATION_TYPE_PRIMARY_STEREO;
            locateInfo.displayTime = frameState.predictedDisplayTime;
            locateInfo.space = appSpace_;
            XrViewState viewState{XR_TYPE_VIEW_STATE};
            uint32_t viewCount = 0;
            xrLocateViews(session_, &locateInfo, &viewState, static_cast<uint32_t>(views_.size()), &viewCount, views_.data());
            for (uint32_t i = 0; i < viewCount; ++i) RenderView(i, views_[i]);
            layer.space = appSpace_;
            layer.viewCount = viewCount;
            layer.views = projectionViews_.data();
            layers.push_back(reinterpret_cast<XrCompositionLayerBaseHeader*>(&layer));
        }

        XrFrameEndInfo endInfo{XR_TYPE_FRAME_END_INFO};
        endInfo.displayTime = frameState.predictedDisplayTime;
        endInfo.environmentBlendMode = XR_ENVIRONMENT_BLEND_MODE_OPAQUE;
        endInfo.layerCount = static_cast<uint32_t>(layers.size());
        endInfo.layers = layers.empty() ? nullptr : layers.data();
        xrEndFrame(session_, &endInfo);
    }

    void RenderView(uint32_t viewIndex, const XrView& view) {
        auto& sc = swapchains_[viewIndex];
        uint32_t imageIndex = 0;
        XrSwapchainImageAcquireInfo acquireInfo{XR_TYPE_SWAPCHAIN_IMAGE_ACQUIRE_INFO};
        xrAcquireSwapchainImage(sc.handle, &acquireInfo, &imageIndex);
        XrSwapchainImageWaitInfo waitInfo{XR_TYPE_SWAPCHAIN_IMAGE_WAIT_INFO};
        waitInfo.timeout = XR_INFINITE_DURATION;
        xrWaitSwapchainImage(sc.handle, &waitInfo);

        GLuint fbo = 0;
        glGenFramebuffers(1, &fbo);
        glBindFramebuffer(GL_FRAMEBUFFER, fbo);
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, sc.images[imageIndex].image, 0);
        glViewport(0, 0, sc.width, sc.height);
        const float pulse = (viewIndex == 0) ? 0.12f : 0.18f;
        glClearColor(0.02f + pulse, handTrackingAvailable_ ? 0.16f : 0.07f, 0.26f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
        glDeleteFramebuffers(1, &fbo);

        projectionViews_[viewIndex] = {XR_TYPE_COMPOSITION_LAYER_PROJECTION_VIEW};
        projectionViews_[viewIndex].pose = view.pose;
        projectionViews_[viewIndex].fov = view.fov;
        projectionViews_[viewIndex].subImage.swapchain = sc.handle;
        projectionViews_[viewIndex].subImage.imageRect.offset = {0, 0};
        projectionViews_[viewIndex].subImage.imageRect.extent = {sc.width, sc.height};

        XrSwapchainImageReleaseInfo releaseInfo{XR_TYPE_SWAPCHAIN_IMAGE_RELEASE_INFO};
        xrReleaseSwapchainImage(sc.handle, &releaseInfo);
    }

    void Shutdown() {
        for (auto& sc : swapchains_) if (sc.handle != XR_NULL_HANDLE) xrDestroySwapchain(sc.handle);
        if (appSpace_ != XR_NULL_HANDLE) xrDestroySpace(appSpace_);
        if (session_ != XR_NULL_HANDLE) xrDestroySession(session_);
        if (instance_ != XR_NULL_HANDLE) xrDestroyInstance(instance_);
        if (display_ != EGL_NO_DISPLAY) {
            eglMakeCurrent(display_, EGL_NO_SURFACE, EGL_NO_SURFACE, EGL_NO_CONTEXT);
            if (surface_ != EGL_NO_SURFACE) eglDestroySurface(display_, surface_);
            if (context_ != EGL_NO_CONTEXT) eglDestroyContext(display_, context_);
            eglTerminate(display_);
        }
    }

    android_app* app_{nullptr};
    bool exitRequested_{false};
    bool sessionRunning_{false};
    bool handTrackingAvailable_{false};
    XrInstance instance_{XR_NULL_HANDLE};
    XrSystemId systemId_{XR_NULL_SYSTEM_ID};
    XrSession session_{XR_NULL_HANDLE};
    XrSpace appSpace_{XR_NULL_HANDLE};
    XrSessionState sessionState_{XR_SESSION_STATE_UNKNOWN};
    EGLDisplay display_{EGL_NO_DISPLAY};
    EGLConfig config_{};
    EGLContext context_{EGL_NO_CONTEXT};
    EGLSurface surface_{EGL_NO_SURFACE};
    std::vector<XrViewConfigurationView> configViews_;
    std::vector<XrView> views_;
    std::vector<ViewSwapchain> swapchains_;
    std::vector<XrCompositionLayerProjectionView> projectionViews_;
};

void android_main(android_app* app) {
    app_dummy();
    SeedSpatialOpenXRApp runtime(app);
    runtime.Run();
}
