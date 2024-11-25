import React, {useRef, useCallback, useState, useEffect} from 'react';
import {
  FlatList,
  View,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import SingleReel from './components/SingleReel';
import {useAutoContinue} from './hooks/useAutoContinue';
import {reelData} from './constants/reelsData';

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

interface Pagination {
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface FetchResponse {
  items: MediaItem[];
  pagination: Pagination;
  reels: MediaItem[];
  memes: MediaItem[];
  key: AnyJson;
}

type AnyJson = {
  [key: string]: string;
};

const VideoStreaming: React.FC = () => {
  const [mute, setMute] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList<MediaItem>>(null);
  const {height: screenHeight} = useWindowDimensions();

  const mediaData = reelData;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const {
    autoContinue,
    toggleAutoContinue,
    handleVideoEnd,
    currentIndex,
    setCurrentIndex,
  } = useAutoContinue(flatListRef, mediaData.length, screenHeight);

  const handleEndReached = () => {
    if (currentIndex >= (mediaData.length || 0) - 2) {
      // Fetch or load more data here if needed
    }
  };

  const handleViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: any[]}) => {
      if (viewableItems.length > 0) {
        const nextIndex = viewableItems[0]?.index;
        if (nextIndex !== currentIndex) {
          setCurrentIndex(nextIndex);
        }
      }
    },
    [currentIndex, setCurrentIndex],
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, 
  };

  const renderItem = useCallback(
    ({item, index}: {item: MediaItem; index: number}) => (
      <SingleReel
        item={item}
        index={index}
        setMute={setMute}
        mute={mute}
        activeTab={'Flicks'}
        currentIndex={currentIndex}
        screenHeight={screenHeight}
        fetchCommentFunction={() => {}}
        handleSaveMeme={(itemId: string) => {}}
        handleReport={(itemId: string, reason: string) => {}}
        onVideoEnd={handleVideoEnd}
        handleContinue={toggleAutoContinue}
        autoContinue={autoContinue}
      />
    ),
    [
      autoContinue,
      currentIndex,
      handleVideoEnd,
      mute,
      screenHeight,
      toggleAutoContinue,
    ],
  );

  const keyExtractor = useCallback((item: MediaItem) => item._id, []);

  return (
    <View style={{flex: 1, height: screenHeight}}>
      <FlatList
        data={mediaData || []}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ref={flatListRef}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        initialNumToRender={2}
        maxToRenderPerBatch={5}
        windowSize={5}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate={'fast'}
        removeClippedSubviews={false}
        disableIntervalMomentum={true}
        pagingEnabled
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default VideoStreaming;
