export type ConditionFn = () => boolean;
export type Predicate<T> = (value: T) => boolean;
export type Getter<T> = () => T;
export type Action<T = void> = T extends void ? () => void : (arg: T) => void;
export type IfEquals<X, Y, A, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;
export type IsReadonly<T, K extends keyof T> = IfEquals<{
    [P in K]: T[P];
}, {
    -readonly [P in K]: T[P];
}, false, true>;
export type MethodsOf<T> = {
    [K in keyof T as T[K] extends (...args: never[]) => unknown ? K : never]: T[K];
};
export type ReadonlyProps<T> = {
    [K in keyof T as IsReadonly<T, K> extends true ? K : never]: T[K];
};
