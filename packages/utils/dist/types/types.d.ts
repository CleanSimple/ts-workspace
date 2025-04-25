export type ConditionFn = () => boolean;
export type Predicate<T> = (value: T) => boolean;
export type Getter<T> = () => T;
