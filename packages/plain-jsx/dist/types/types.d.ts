import type { Action, MethodsOf, ReadonlyProps, Setter } from '@cleansimple/utils-js';
import type { Properties as CSS } from 'csstype';
import type { Observable, Subscription } from './reactive';
import type { ReactiveNode } from './reactive-node';
import type { Ref } from './ref';
export type JSXNode = Observable<JSXNode> | JSXElement | string | number | boolean | null | undefined | JSXNode[];
export interface JSXElement {
    type: string | FunctionalComponent;
    props: PropsType;
}
export interface VNodeBase {
    type: 'root' | 'text' | 'element' | 'component' | 'builtin' | 'observable';
    parent: VNode | null;
    firstChild: VNode | null;
    lastChild: VNode | null;
    next: VNode | null;
}
export interface VNodeRoot extends VNodeBase {
    type: 'root';
}
export interface VNodeText extends VNodeBase {
    type: 'text';
    ref: Text;
}
export interface VNodeElement extends VNodeBase {
    type: 'element';
    ref: Element;
    addSubscriptions: (subscriptions: Subscription[]) => void;
    unmount: Action;
}
export interface VNodeFunctionalComponent extends VNodeBase {
    type: 'component';
    ref: object | null;
    addSubscription: (subscription: Subscription) => void;
    mount: Action;
    unmount: Action;
    onMountCallback: Action | null;
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
export type VNode = VNodeRoot | VNodeText | VNodeElement | VNodeFunctionalComponent | VNodeBuiltinComponent | VNodeObservable;
export type RNode = ChildNode | ReactiveNode;
export type DOMNode = ChildNode;
export type FunctionalComponent<TProps = object, TRef extends object = object> = (props: TProps & {
    ref?: Ref<TRef>;
}, helpers: {
    /**
     * A helper function to define the component's ref interface.
     * @example
     * interface CounterRef {
     *     increment(): void;
     *     decrement(): void;
     * }
     * interface CounterProps {
     * }
     * const Counter: FunctionalComponent<CounterProps, CounterRef> = (props, { defineRef }) => {
     *     const count = val(0);
     *     defineRef({
     *         increment() { count.value += 1; },
     *         decrement() { count.value -= 1; },
     *     });
     *     return <span>{count}</span>;
     * };
     */
    defineRef: Setter<TRef>;
}) => JSXNode;
export type PropsType = Record<string, unknown> & {
    ref?: Ref<object>;
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
type SettableProps<T extends Element> = Omit<T, keyof (ReadonlyProps<T> & MethodsOf<T> & CommonProps<T> & GlobalEventHandlers) | 'className' | 'classList'>;
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
export {};
