import React, {useState, useEffect, memo} from 'react';
import {
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
} from 'react-native';
import {ms, mvs, s, vs} from '../utils/scaling';
import VideoPlayer from '../native/VideoPlayer';
interface Owner {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

interface Comment {
  user: Owner;
  comment: string;
  likes: string[];
  replies: Reply[];
  _id: string;
  createdAt: string;
}

interface Reply {
  user: Owner;
  reply: string;
  likes: string[];
  _id: string;
  createdAt: string;
}
interface MediaItem {
  _id: string;
  owner: Owner;
  title: string;
  description: string;
  videoUrl?: string;
  thumbnailUrl: string;
  likes: {isLikedByMe: false; likeCount: string; recentLike: any};
  downloads: number;
  sharedWith: string[];
  comments: Comment[];
}

interface SingleReelProps {
  item: MediaItem;
  index: number;
  currentIndex: number;
  screenHeight: number;
  handleReport: (itemId: string, reason: string) => void;
  fetchCommentFunction?: any;
  addCommentFunction?: any;
  addCommentLikeFunction?: any;
  addReplyLikeFunction?: any;
  addReplyCommentFunction?: any;
  setMute: (value: boolean) => void;
  mute: boolean;
  handleContinue: () => void;
  onVideoEnd: () => void;
  autoContinue: boolean;
  activeTab: string;
  handleSaveMeme: (itemId: string) => void;
}
const windowWidth = Dimensions.get('window').width;

const SingleReel: React.FC<SingleReelProps> = memo(
  ({item, index, currentIndex, screenHeight, onVideoEnd, mute}) => {
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const [isPaused, setIsPaused] = useState(true);

    useEffect(() => {
      if (currentIndex === index) {
        console.log('is focued');

        setIsPaused(false);
      } else {
        setIsPaused(true);
      }
    }, [currentIndex, index]);

    const onProgress = (data: {currentTime: number}) => {
      if (duration > 0) {
        setProgress((data.currentTime / duration) * 100);
      }
    };

    const onLoad = (data: {duration: number}) => {
      setDuration(data.duration);
    };

    const onEnd = () => {
      if (onVideoEnd) {
        onVideoEnd();
      }
    };

    return (
      <>
        <View
          style={[
            styles.container,
            {width: windowWidth, height: screenHeight},
          ]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={() => setIsPaused(!isPaused)}
            style={{
              ...styles.fullScreen,
              width: windowWidth,
              height: screenHeight,
            }}>
            {isPaused && (
              <Image
                source={{uri: item?.thumbnailUrl}}
                style={styles.thumbnail}
              />
            )}
            <VideoPlayer
              videoUrl={item?.videoUrl}
              paused={currentIndex !== index || isPaused}
              muted={mute}
              style={{
                ...styles.fullScreen,
                width: windowWidth,
                height: screenHeight,
              }}
              poster={item?.thumbnailUrl}
              onVideoLoad={() => console.log('Video Loaded')}
              onVideoLoadStart={() => console.log('Load Started')}
              onVideoLoadProgress={onProgress}
              onVideoError={error => console.error('Video Error:', error)}
              onVideoEnded={onEnd}
            />
          </TouchableOpacity>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, {width: `${progress}%`}]} />
          </View>
          {mute && (
            <View style={styles.muteIndicator}>
              <Text>Mute</Text>
            </View>
          )}
        </View>
      </>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    flex: 1,
  },
  thumbnail: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  progressBarContainer: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(221, 221, 221, 0.3)',
    bottom: 0,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  muteIndicator: {
    fontSize: 20,
    color: 'white',
    position: 'absolute',
    backgroundColor: 'rgba(52, 52, 52, 0.6)',
    borderRadius: 100,
    padding: 20,
  },
  bottomContainer: {
    position: 'absolute',
    width: '70%',
    zIndex: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 2,
    paddingVertical: 10,
    right: 100,
  },
  profileContainer: {
    width: 150,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 100,
    backgroundColor: 'white',
    margin: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 100,
  },
  title: {
    color: '#FFFFFF',
    fontSize: mvs(12),
    fontWeight: '500',
  },
  followButton: {
    borderWidth: 0.5,
    borderRadius: ms(4),
    borderColor: '#FFFFFF',
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    marginLeft: s(10),
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  description: {
    color: '#FFFFFF',
    fontSize: mvs(12),
    marginHorizontal: 10,
    height: vs(50),
    fontWeight: '500',
  },
  audioContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  audioText: {
    color: 'white',
  },
  rightContainer: {
    position: 'absolute',
    bottom: vs(40),
    right: 0,
    gap: 2,
  },
  actionButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonLike: {
    paddingHorizontal: 4,
    paddingVertical: vs(5),
    paddingBottom: vs(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: mvs(12),
    textAlign: 'center',
    fontWeight: '700',
  },
  helperText: {
    color: '#FFFFFF',
    fontSize: mvs(10),
    textAlign: 'center',
    fontWeight: '700',
    width: s(50),
    lineHeight: 20,
    height: vs(20),
  },
  smallProfileImageContainer: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    margin: 10,
  },
  smallProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  playPauseButton: {
    backgroundColor: '#00000075',
    padding: ms(15),
    borderRadius: ms(75),
  },
});

export default SingleReel;
