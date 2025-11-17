import type { Observable } from '@cleansimple/observable';
import type { JSXNode, Predicate } from '../types';
type Truthy<T> = Exclude<T, 0 | '' | null | false | undefined>;
type Falsy<T> = T extends number | string | false | null | undefined ? T : never;
type ExtractGuardedType<F> = F extends ((val: any) => val is infer T) ? T : boolean;
interface ShowPropsBase<T> {
    when: T | Observable<T>;
    is?: T | Predicate<T>;
    /**
     * If `true`, the children will be re-rendered when the value changes.
     * @default false
     */
    keyed?: boolean;
}
export interface ShowProps<T> extends ShowPropsBase<T> {
    fallback?: JSXNode | ((value: T) => JSXNode);
    children: JSXNode | ((value: T) => JSXNode);
}
interface ShowWhenProps<T> extends ShowPropsBase<T> {
    is?: never;
    fallback?: JSXNode | ((value: Falsy<T>) => JSXNode);
    children: JSXNode | ((value: Truthy<T>) => JSXNode);
}
interface ShowWhenIsProps<T, TIs extends T | Predicate<T>> extends ShowPropsBase<T> {
    is: TIs;
    fallback?: JSXNode | ((value: Exclude<T, TIs extends T ? TIs : ExtractGuardedType<TIs>>) => JSXNode);
    children: JSXNode | ((value: TIs extends T ? TIs : ExtractGuardedType<TIs>) => JSXNode);
}
export declare function Show<T>(props: ShowWhenProps<T>): JSXNode;
export declare function Show<T, TIs extends T | Predicate<T>>(props: ShowWhenIsProps<T, TIs>): JSXNode;
export {};
