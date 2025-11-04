export type ConditionFn = () => boolean;
export type Predicate<T> = (value: T) => boolean;
export type Getter<T> = () => T;
export type Setter<T> = (value: T) => void;
export type Action<T = void> = [T] extends [void] ? () => void : (arg: T) => void;
export type MaybePromise<T> = T | Promise<T>;
export type ArrayElementType<T extends readonly unknown[]> = T extends readonly (infer TElem)[] ? TElem : never;
export type AnyFunc = (...args: any[]) => any;
export type Primitive = string | number | boolean | bigint | symbol | null | undefined;
export type IfEquals<X, Y, A, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;
export type IsReadonly<T, K extends keyof T> = IfEquals<{
    [P in K]: T[P];
}, {
    -readonly [P in K]: T[P];
}, false, true>;
/** Note: Does not match setters/getters */
export type MethodsOf<T> = {
    [K in keyof T as T[K] extends AnyFunc ? K : never]: T[K];
};
/** Note: Does not match setter-only properties */
export type ReadonlyProps<T> = {
    [K in keyof T as IsReadonly<T, K> extends true ? K : never]: T[K];
};
