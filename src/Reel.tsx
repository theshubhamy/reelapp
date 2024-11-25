import React, {useRef, useCallback, useState} from 'react';
import {
  FlatList,
  View,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import SingleReel from './components/SingleReel';

import {useAutoContinue} from './hooks/useAutoContinue';
import {SwiperFlatList} from './components/SwiperFlatList';
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

  // Function to handle refreshing
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  const {
    autoContinue,
    toggleAutoContinue,
    handleVideoEnd,
    currentIndex,
    setCurrentIndex,
  } = useAutoContinue(flatListRef, mediaData.length, screenHeight);

  const handleEndReached = () => {
    const mediaDataLength = mediaData.length || 0;
    if (currentIndex >= mediaDataLength - 2) {
    }
  };

  const handleViewableItemsChanged = useCallback(
    ({viewableItems}: {viewableItems: any[]}) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [setCurrentIndex],
  );

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

  const keyExtractor = useCallback((item: any) => item._id.toString(), []);

  return (
    <View style={{height: screenHeight}}>
      <SwiperFlatList
        data={mediaData || []}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        index={currentIndex}
        vertical
        decelerationRate={'normal'}
        renderItem={renderItem}
        disableIntervalMomentum={true}
        onViewableItemsChanged={handleViewableItemsChanged}
        initialNumToRender={1}
        maxToRenderPerBatch={10}
        windowSize={1}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.8}
      />
    </View>
  );
};

export default VideoStreaming;
