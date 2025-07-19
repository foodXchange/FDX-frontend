declare module 'react-window-infinite-loader' {
  import { ComponentType, ReactNode } from "react";

  export interface InfiniteLoaderProps {
    children: (props: {
      onItemsRendered: (props: { 
        visibleStartIndex: number;
        visibleStopIndex: number;
      }) => void;
      ref: (ref: any) => void;
    }) => ReactNode;
    isItemLoaded: (index: number) => boolean;
    itemCount: number;
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void> | void;
    minimumBatchSize?: number;
    threshold?: number;
  }

  const InfiniteLoader: ComponentType<InfiniteLoaderProps>;
  export default InfiniteLoader;
}