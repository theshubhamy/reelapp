package com.awesomeproject

import android.content.Context
import android.net.Uri
import androidx.media3.common.C
import android.util.AttributeSet
import android.widget.FrameLayout
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.source.ProgressiveMediaSource
import androidx.media3.ui.PlayerView
import androidx.media3.common.PlaybackException
import androidx.media3.common.util.Log
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.datasource.cache.LeastRecentlyUsedCacheEvictor
import androidx.media3.datasource.cache.SimpleCache
import androidx.media3.database.StandaloneDatabaseProvider
import androidx.media3.ui.AspectRatioFrameLayout
import java.io.File


@UnstableApi
class CustomVideoPlayerAndroid @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr), DefaultLifecycleObserver {

    // Views
    private var playerView: PlayerView

    // ExoPlayer instance
    private var exoPlayer: ExoPlayer? = null

    // Cache instance
    private var simpleCache: SimpleCache? = null

    init {
        playerView = PlayerView(context).apply {
            layoutParams = LayoutParams(
                LayoutParams.MATCH_PARENT,
                LayoutParams.MATCH_PARENT
            )
            useController = false
            setResizeMode(AspectRatioFrameLayout.RESIZE_MODE_FIXED_WIDTH)
        }
        addView(playerView)

        setupCache(context)
        setupPlayer()
    }

    // Step 1: Set up SimpleCache for video caching
    private fun setupCache(context: Context) {
        simpleCache = CacheManager.getCache(context)
    }



    // Step 2: Set up ExoPlayer instance
    private fun setupPlayer() {
        exoPlayer = ExoPlayer.Builder(context).build().apply {
            videoScalingMode = C.VIDEO_SCALING_MODE_SCALE_TO_FIT
            repeatMode = Player.REPEAT_MODE_ONE
            setHandleAudioBecomingNoisy(true)
            addListener(object : Player.Listener {
                override fun onPlaybackStateChanged(state: Int) {
                    when (state) {
                        Player.STATE_READY -> {
                            Log.d("CustomVideoPlayer", "Player ready")
                            playerView.visibility = VISIBLE
                        }

                        Player.STATE_BUFFERING -> {
                            Log.d("CustomVideoPlayer", "Buffering...")
                        }

                        Player.STATE_ENDED -> {
                            Log.d("CustomVideoPlayer", "Playback ended")
                            onVideoEnded?.invoke()
                        }

                        Player.STATE_IDLE -> {
                            Log.d("CustomVideoPlayer", "Player idle")

                        }
                    }
                }

                override fun onPlayerError(error: PlaybackException) {
                    Log.e("CustomVideoPlayer", "Player error: ${error.localizedMessage}")
                    onVideoError?.invoke(error.localizedMessage ?: "Unknown error")
                }
            })
        }

        playerView.player = exoPlayer
    }


    // Step 3: Set video URL with caching
    fun setVideoUrl(url: String) {

        Log.d("CustomVideoPlayer", "Setting video URL: $url")
        val cacheDataSourceFactory = CacheDataSource.Factory()
            .setCache(simpleCache!!)
            .setUpstreamDataSourceFactory(DefaultHttpDataSource.Factory())
            .setFlags(CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR)

        val mediaSource = ProgressiveMediaSource.Factory(cacheDataSourceFactory)
            .createMediaSource(MediaItem.fromUri(Uri.parse(url)))

        exoPlayer?.setMediaSource(mediaSource)
        exoPlayer?.prepare()
    }



    // Step 5: Pause or play video
    fun setPaused(paused: Boolean) {
        if (paused) exoPlayer?.pause() else exoPlayer?.play()
    }

    // Step 6: Mute or Unmute video
    fun setMuted(muted: Boolean) {
        exoPlayer?.volume = if (muted) 0f else 1f
    }

    // Step 7: Lifecycle management
    override fun onResume(owner: LifecycleOwner) {
        exoPlayer?.playWhenReady = true
    }

    override fun onPause(owner: LifecycleOwner) {
        exoPlayer?.playWhenReady = false
    }

    override fun onDestroy(owner: LifecycleOwner) {
        exoPlayer?.release()
        exoPlayer = null
    }

    // Step 8: Event callbacks
    var onVideoEnded: (() -> Unit)? = null
    var onVideoError: ((error: String) -> Unit)? = null

    // Cache Manager - Defined in the same file for simplicity

    object CacheManager {
        private var simpleCache: SimpleCache? = null

        @UnstableApi
        fun getCache(context: Context): SimpleCache {
            if (simpleCache == null) {
                val cacheSize: Long = 100 * 1024 * 1024 // 100MB cache size
                val cacheDirectory = File(context.cacheDir, "media_cache")
                val cacheEvictor = LeastRecentlyUsedCacheEvictor(cacheSize)
                val databaseProvider = StandaloneDatabaseProvider(context)
                simpleCache = SimpleCache(cacheDirectory, cacheEvictor, databaseProvider)
            }
            return simpleCache!!
        }
    }
}
