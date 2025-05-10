export type ConditionFn = () => boolean;
export type Predicate<T> = (value: T) => boolean;
export type Getter<T> = () => T;
export type Action<T = void> = T extends void ? () => void : (arg: T) => void;
