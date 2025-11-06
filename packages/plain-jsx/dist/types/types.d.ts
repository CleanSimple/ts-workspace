import type { Action, MethodsOf, ReadonlyProps } from '@cleansimple/utils-js';
import type { Properties as CSS } from 'csstype';
import type { Observable, Ref, Subscription } from './observable';
import type { ReactiveNode } from './reactive-node';
export type JSXNode = Observable<JSXNode> | JSXElement | string | number | boolean | null | undefined | JSXNode[];
export interface JSXElement {
    type: string | FunctionalComponent;
    props: PropsType;
}
export interface VNodeBase {
    type: 'text' | 'element' | 'component' | 'builtin' | 'observable';
    parent: VNode | null;
    firstChild: VNode | null;
    lastChild: VNode | null;
    next: VNode | null;
}
export interface VNodeText extends VNodeBase {
    type: 'text';
    ref: Text;
}
export interface VNodeElement extends VNodeBase {
    type: 'element';
    ref: Element;
    subscriptions: Subscription[] | null;
    unmount: Action;
}
export interface VNodeFunctionalComponent extends VNodeBase {
    type: 'component';
    ref: object | null;
    mount: Action;
    unmount: (force: boolean) => void;
    onMountCallback: (() => void | Subscription[]) | null;
    onUnmountCallback: Action | null;
}
export interface VNodeBuiltinComponent extends VNodeBase {
    type: 'builtin';
    ref: ReactiveNode;
    unmount: Action;
}
export interface VNodeObservable extends VNodeBase {
    type: 'observable';
    ref: ReactiveNode;
    unmount: Action;
}
export type VNode = VNodeText | VNodeElement | VNodeFunctionalComponent | VNodeBuiltinComponent | VNodeObservable;
export type RNode = ChildNode | ReactiveNode;
export type DOMNode = ChildNode;
export type FunctionalComponent = (...args: unknown[]) => JSXNode;
export type PropsType = Record<string, unknown> & {
    ref?: unknown;
    children?: JSXNode;
};
type Classes = Record<`class:${string}`, boolean | Observable<boolean>>;
type CommonProps<T extends Element> = Classes & {
    ref?: Ref<T>;
    children?: JSXNode;
    class?: string;
    style?: CSS | string;
    dataset?: DOMStringMap;
};
type SettableProps<T extends Element> = Omit<T, keyof (ReadonlyProps<T> & MethodsOf<T> & CommonProps<T> & GlobalEventHandlers) & 'className' & 'classList'>;
type TypedEvent<TElement extends Element, TEvent extends Event = Event> = TEvent & {
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
export type SVGProps<T extends SVGElement> = DOMProps<T> & Record<string, unknown>;
export type HasVNode<T extends Node> = T & {
    __vNode: VNode;
};
export {};
