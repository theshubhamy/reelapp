/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useRef, useEffect} from 'react';
import {
  requireNativeComponent,
  Platform,
  View,
  ViewStyle,
  Image,
  NativeModules,
  StyleSheet,
} from 'react-native';

// Define separate components for iOS and Android
const CustomVideoPlayerIOS =
  Platform.OS === 'ios' ? requireNativeComponent('CustomVideoPlayer') : null;

const CustomVideoPlayerAndroid =
  Platform.OS === 'android'
    ? requireNativeComponent('CustomVideoPlayerAndroid')
    : null;
console.log('CustomVideoPlayerAndroid', CustomVideoPlayerAndroid);

interface VideoPlayerProps {
  videoUrl?: string;
  paused?: boolean;
  muted?: boolean;
  style?: ViewStyle;
  poster?: string;
  onVideoLoad?: () => void;
  onVideoLoadStart?: () => void;
  onVideoLoadProgress?: (progress: {
    currentTime: number;
    playableDuration: number;
    seekableDuration: number;
    currentPlaybackTime: number;
  }) => void;
  onVideoError?: (error: string) => void;
  onVideoEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  paused,
  muted,
  style,
  poster,
  onVideoLoad,
  onVideoLoadStart,
  onVideoLoadProgress,
  onVideoError,
  onVideoEnded,
}) => {
  const handleError = useCallback(
    (event: {nativeEvent: {error: string}}) => {
      const errorMessage = event.nativeEvent?.error || 'Unknown error occurred';
      console.error('[VideoPlayer] Error:', errorMessage);
      if (onVideoError) {
        onVideoError(errorMessage);
      }
    },
    [onVideoError],
  );

  const handleReady = useCallback(() => {
    if (onVideoLoad) {
      onVideoLoad();
    }
  }, [onVideoLoad]);

  const handleLoadStart = useCallback(() => {
    if (onVideoLoadStart) {
      onVideoLoadStart();
    }
  }, [onVideoLoadStart]);

  const handleLoadProgress = useCallback(
    (event: {
      nativeEvent: {
        currentTime: number;
        playableDuration: number;
        seekableDuration: number;
        currentPlaybackTime: number;
      };
    }) => {
      if (onVideoLoadProgress) {
        const {
          currentTime,
          playableDuration,
          seekableDuration,
          currentPlaybackTime,
        } = event.nativeEvent;

        onVideoLoadProgress({
          currentTime,
          playableDuration,
          seekableDuration,
          currentPlaybackTime,
        });
      }
    },
    [onVideoLoadProgress],
  );

  const handleEnd = useCallback(() => {
    if (onVideoEnded) {
      onVideoEnded();
    }
  }, [onVideoEnded]);

  const videoProps = {
    style: {
      width: '100%',
      height: '100%',
      ...style,
    },
    paused,
    muted,
  };

  const androidProps = {
    ...videoProps,
    videoUrl,
    onReady: handleReady,
    onError: handleError,
    onLoadStart: handleLoadStart,
    onLoadProgress: handleLoadProgress,
    onEnd: handleEnd,
  };

  const iosProps = {
    ...videoProps,
    videoUrl,
    poster,
    onVideoLoad: handleReady,
    onVideoLoadStart: handleLoadStart,
    onVideoLoadProgress: handleLoadProgress,
    onVideoEnded: handleEnd,
    onVideoError: handleError,
  };
  const playerRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) {
      // Setting paused state
      NativeModules.UIManager.dispatchViewManagerCommand(
        playerRef.current,
        NativeModules.UIManager.CustomVideoPlayerAndroid.Commands.setPaused,
        [paused],
      );

      // Setting muted state
      NativeModules.UIManager.dispatchViewManagerCommand(
        playerRef.current,
        NativeModules.UIManager.CustomVideoPlayerAndroid.Commands.setMuted,
        [muted],
      );
    }
  }, [paused, muted]);

  return (
    <View style={[style, StyleSheet.absoluteFillObject]}>
      {/* Show poster image when paused or no video URL */}
      {poster && (paused || !videoUrl) && (
        <Image
          source={{uri: poster}}
          style={[{position: 'absolute', width: '100%', height: '100%'}]}
          resizeMode="cover"
        />
      )}
      {Platform.OS === 'ios' && CustomVideoPlayerIOS ? (
        <CustomVideoPlayerIOS {...iosProps} />
      ) : Platform.OS === 'android' && CustomVideoPlayerAndroid ? (
        <CustomVideoPlayerAndroid {...androidProps} />
      ) : null}
    </View>
  );
};

export default VideoPlayer;
