package com.awesomeproject

import android.util.Log
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.annotations.ReactProp

class CustomVideoPlayerManager : SimpleViewManager<View>() {

    // Define a unique name for this view type, used in React Native JS code.
    override fun getName(): String {
        return "CustomVideoPlayerAndroid"
    }

    // Create and return an instance of the custom video player view.
    override fun createViewInstance(reactContext: ThemedReactContext): View {
        return CustomVideoPlayerAndroid(reactContext)
    }

    // Expose props that you can set from JS.
    @ReactProp(name = "videoUrl")
    fun setVideoUrl(view: CustomVideoPlayerAndroid, videoUrl: String?) {
        Log.e("CustomVideoPlayer", "Setting video URL: $videoUrl")
        view.setVideoUrl(videoUrl ?: "")
    }

    @ReactProp(name = "paused")
    fun setPaused(view: CustomVideoPlayerAndroid, paused: Boolean) {
        view.setPaused(paused)
    }

    @ReactProp(name = "muted")
    fun setMuted(view: CustomVideoPlayerAndroid, muted: Boolean) {
        view.setMuted(muted)
    }



}

