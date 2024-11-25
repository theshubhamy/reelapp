import React, {useState} from 'react';
import {FlatList} from 'react-native';

export const useAutoContinue = (
  flatListRef: React.RefObject<FlatList>,
  reelsDataLength: number,
  screenHeight: number,
) => {
  const [autoContinue, setAutoContinue] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const toggleAutoContinue = () => {
    setAutoContinue(prev => !prev);
  };

  const handleVideoEnd = () => {
    if (autoContinue && currentIndex < reelsDataLength - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * screenHeight,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }
  };

  return {
    autoContinue,
    toggleAutoContinue,
    handleVideoEnd,
    currentIndex,
    setCurrentIndex,
  };
};
