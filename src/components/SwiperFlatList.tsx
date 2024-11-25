import React, {useRef} from 'react';
import {
  FlatList as RNFlatList,
  FlatListProps,
  Platform,
  useWindowDimensions,
  ViewabilityConfigCallbackPair,
  ViewabilityConfigCallbackPairs,
} from 'react-native';

const MILLISECONDS = 1000;
const FIRST_INDEX = 0;
const ITEM_VISIBLE_PERCENT_THRESHOLD = 60;

type ScrollToIndex = {index: number; animated?: boolean};

export const SwiperFlatList = React.forwardRef(
  (
    {
      vertical = false,
      children,
      data = [],
      renderItem,
      renderAll = false,
      index = FIRST_INDEX,
      autoplayDelay = 3,
      autoplay = false,
      autoplayLoop = false,
      autoplayLoopKeepAnimation = false,
      onChangeIndex,
      ListFooterComponent, // Make sure this prop is properly passed
      onMomentumScrollEnd,
      onViewableItemsChanged,
      viewabilityConfig = {},
      disableGesture = false,
      ...props
    }: any,
    ref: React.Ref<any>,
  ) => {
    const {width, height} = useWindowDimensions();
    let _data: unknown[] = [];
    let _renderItem: FlatListProps<any>['renderItem'];

    if (children) {
      _data = Array.isArray(children) ? children : [children];
      _renderItem = ({item}) => item;
    } else if (data) {
      _data = data;
      _renderItem = renderItem;
    } else {
      console.error('Invalid props, `data` or `children` is required');
    }

    const size = _data.length;
    const _initialNumToRender = renderAll ? size : 1;
    const [currentIndexes, setCurrentIndexes] = React.useState({
      index,
      prevIndex: index,
    });
    const [ignoreOnMomentumScrollEnd, setIgnoreOnMomentumScrollEnd] =
      React.useState(false);
    const flatListElement = React.useRef<RNFlatList<unknown>>(null);
    const [scrollEnabled, setScrollEnabled] = React.useState(!disableGesture);

    React.useEffect(() => {
      setScrollEnabled(!disableGesture);
    }, [disableGesture]);

    const _onChangeIndex = React.useCallback(
      ({
        index: _index,
        prevIndex: _prevIndex,
      }: {
        index: number;
        prevIndex: number;
      }) => {
        if (_index !== _prevIndex) {
          onChangeIndex?.({index: _index, prevIndex: _prevIndex});
        }
      },
      [onChangeIndex],
    );

    const _scrollToIndex = React.useCallback(
      (params: ScrollToIndex) => {
        const {index: indexToScroll, animated = true} = params;
        const newParams = {animated, index: indexToScroll};

        setIgnoreOnMomentumScrollEnd(true);

        const next = {
          index: indexToScroll,
          prevIndex: currentIndexes.index,
        };
        if (
          currentIndexes.index !== next.index &&
          currentIndexes.prevIndex !== next.prevIndex
        ) {
          setCurrentIndexes({index: next.index, prevIndex: next.prevIndex});
        } else if (currentIndexes.index !== next.index) {
          setCurrentIndexes(prevState => ({...prevState, index: next.index}));
        } else if (currentIndexes.prevIndex !== next.prevIndex) {
          setCurrentIndexes(prevState => ({
            ...prevState,
            prevIndex: next.prevIndex,
          }));
        }

        flatListElement?.current?.scrollToIndex(newParams);
      },
      [currentIndexes.index, currentIndexes.prevIndex],
    );

    React.useEffect(() => {
      _onChangeIndex({
        index: currentIndexes.index,
        prevIndex: currentIndexes.prevIndex,
      });
    }, [_onChangeIndex, currentIndexes.index, currentIndexes.prevIndex]);

    React.useImperativeHandle(ref, () => ({
      scrollToIndex: (item: ScrollToIndex) => {
        setScrollEnabled(true);
        _scrollToIndex(item);
        setScrollEnabled(!disableGesture);
      },
      getCurrentIndex: () => currentIndexes.index,
      getPrevIndex: () => currentIndexes.prevIndex,
      goToLastIndex: () => {
        setScrollEnabled(true);
        _scrollToIndex({index: size - 1});
        setScrollEnabled(!disableGesture);
      },
      goToFirstIndex: () => {
        setScrollEnabled(true);
        _scrollToIndex({index: FIRST_INDEX});
        setScrollEnabled(!disableGesture);
      },
    }));

    React.useEffect(() => {
      const isLastIndexEnd = currentIndexes.index === _data.length - 1;
      const shouldContinueWithAutoplay = autoplay && !isLastIndexEnd;
      let autoplayTimer: ReturnType<typeof setTimeout>;
      if (shouldContinueWithAutoplay || autoplayLoop) {
        autoplayTimer = setTimeout(() => {
          if (_data.length < 1) {
            return;
          }

          if (!autoplay) {
            return;
          }

          const nextIncrement = +1;

          let nextIndex = (currentIndexes.index + nextIncrement) % _data.length;
          if (nextIndex < FIRST_INDEX) {
            nextIndex = _data.length - 1;
          }

          const animate = !isLastIndexEnd || autoplayLoopKeepAnimation;

          _scrollToIndex({index: nextIndex, animated: animate});
        }, autoplayDelay * MILLISECONDS);
      }
      return () => clearTimeout(autoplayTimer);
    }, [
      autoplay,
      currentIndexes.index,
      _data.length,
      autoplayLoop,
      autoplayDelay,
      autoplayLoopKeepAnimation,
      _scrollToIndex,
    ]);

    const _onMomentumScrollEnd: FlatListProps<unknown>['onMomentumScrollEnd'] =
      event => {
        if (ignoreOnMomentumScrollEnd) {
          setIgnoreOnMomentumScrollEnd(false);
          return;
        }

        onMomentumScrollEnd?.({index: currentIndexes.index}, event);
      };

    const _onViewableItemsChanged = React.useMemo<
      ViewabilityConfigCallbackPair['onViewableItemsChanged']
    >(
      () => params => {
        const {changed} = params;
        for (const newItem of changed) {
          if (newItem !== undefined) {
            const nextIndex = newItem.index as number;
            if (newItem.isViewable) {
              setCurrentIndexes(prevState => ({
                ...prevState,
                index: nextIndex,
              }));
            } else {
              setCurrentIndexes(prevState => ({
                ...prevState,
                prevIndex: nextIndex,
              }));
            }
          }
        }

        onViewableItemsChanged?.(params);
      },
      [onViewableItemsChanged],
    );

    const viewabilityConfigCallbackPairs =
      useRef<ViewabilityConfigCallbackPairs>([
        {
          onViewableItemsChanged: _onViewableItemsChanged,
          viewabilityConfig: {
            minimumViewTime: 200,
            itemVisiblePercentThreshold: ITEM_VISIBLE_PERCENT_THRESHOLD,
            ...viewabilityConfig,
          },
        },
      ]);

    const flatListProps: FlatListProps<unknown> & {
      ref: React.RefObject<RNFlatList<unknown>>;
    } = {
      scrollEnabled,
      ref: flatListElement,
      keyExtractor: (_item, _index) => {
        const item = _item as {key?: string; id?: string};
        const key = item?.key ?? item?.id ?? _index.toString();
        return key;
      },
      horizontal: !vertical,
      showsHorizontalScrollIndicator: false,
      showsVerticalScrollIndicator: false,
      pagingEnabled: true,
      ListFooterComponent,
      ...props,
      onMomentumScrollEnd: _onMomentumScrollEnd,
      onScrollToIndexFailed: info =>
        setTimeout(() => _scrollToIndex({index: info.index, animated: false})),
      data: _data,
      renderItem: _renderItem,
      initialNumToRender: _initialNumToRender,
      initialScrollIndex: index,
      viewabilityConfig: {
        minimumViewTime: 200,
        itemVisiblePercentThreshold: ITEM_VISIBLE_PERCENT_THRESHOLD,
        ...viewabilityConfig,
      },
      viewabilityConfigCallbackPairs:
        Platform.OS === 'ios'
          ? viewabilityConfigCallbackPairs.current
          : undefined,
      onViewableItemsChanged:
        Platform.OS === 'android' ? _onViewableItemsChanged : undefined,
    };

    if (props.getItemLayout === undefined) {
      const itemDimension = vertical ? height : width;
      flatListProps.getItemLayout = (__data, ItemIndex: number) => ({
        length: itemDimension,
        offset: itemDimension * ItemIndex,
        index: ItemIndex,
      });
    }

    return (
      <React.Fragment>
        <RNFlatList {...flatListProps} />
      </React.Fragment>
    );
  },
);
