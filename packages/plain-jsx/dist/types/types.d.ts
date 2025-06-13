import type { MethodsOf, ReadonlyProps } from '@lib/utils';
import type { Properties as CSS } from 'csstype';
import type { Observable } from './observable';
export type PropsType = Record<string, unknown>;
export type DOMNode = Observable<VNode> | ChildNode | string | number | boolean | null | undefined;
export type VNode = VNode[] | DOMNode;
export type VNodeChildren = VNode | VNode[];
export type FunctionalComponent = (...args: unknown[]) => VNode;
/** Represents a rendered VNode */
export type RNode = ChildNode | ChildNode[] | null;
export interface Component {
    id: number;
    ref?: unknown;
}
type ClassProp = `class:${string}`;
type Classes = Record<ClassProp, boolean | Observable<boolean>>;
type CommonProps<T extends Element> = (T extends ElementCSSInlineStyle ? {
    style?: CSS | string;
} : object) & (T extends HTMLOrSVGElement ? {
    dataset?: DOMStringMap;
} : object) & Classes & {
    ref?: Observable<T | null>;
    children?: VNodeChildren;
    class?: string;
};
type SettableProps<T extends Element> = Omit<T, keyof (ReadonlyProps<T> & MethodsOf<T> & CommonProps<T> & GlobalEventHandlers & {
    className: never;
    classList: never;
})>;
type TypedEvent<TElement extends Element, TEvent extends Event = Event> = Omit<TEvent, 'currentTarget'> & {
    currentTarget: TElement;
};
type DOMEvents<T extends Element> = {
    [K in keyof GlobalEventHandlersEventMap as `on:${K}`]?: (this: T, ev: TypedEvent<T, GlobalEventHandlersEventMap[K]>) => unknown;
};
type AcceptsObservable<T> = (T extends infer U ? Observable<U> : never) | Observable<T>;
type AsAcceptsObservable<T> = {
    [K in keyof T]: T[K] | AcceptsObservable<T[K]>;
};
export type DOMProps<T extends Element> = Partial<AsAcceptsObservable<SettableProps<T>>> & CommonProps<T> & DOMEvents<T>;
export type SVGProps<T extends SVGElement> = DOMProps<T> & AcceptsObservable<Record<string, unknown>>;
export {};
