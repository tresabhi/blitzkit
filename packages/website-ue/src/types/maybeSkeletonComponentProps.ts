export type MaybeSkeletonComponentProps<T = {}> =
  | {
      skeleton: true;
      onIntersection?: () => void;
    }
  | (T & {
      skeleton?: false;
    });
