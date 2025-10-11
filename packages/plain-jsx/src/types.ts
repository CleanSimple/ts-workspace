import type { Action, MethodsOf, ReadonlyProps } from '@cleansimple/utils-js';
import type { Properties as CSS } from 'csstype';
import type { Observable, Ref, Subscription } from './observable';
import type { ReactiveNode } from './reactive-node';

/* JSX Node */
export type JSXNode =
    | Observable<JSXNode>
    | JSXElement
    | string
    | number
    | boolean
    | null
    | undefined
    | JSXNode[];

export interface JSXElement {
    type: string | FunctionalComponent;
    props: PropsType;
}

/* VNode */
export interface VNodeBase<TValue> {
    type: 'text' | 'element' | 'component' | 'builtin' | 'observable';
    value: TValue;
    parent: VNode | null;
    firstChild: VNode | null; // head
    lastChild: VNode | null; // tail
    next: VNode | null;
}

export interface VNodeText extends VNodeBase<string | number> {
    type: 'text';
    ref: Text;
}

export interface VNodeElement extends VNodeBase<string> {
    type: 'element';
    props: PropsType;
    ref: Element;
    subscriptions: Subscription[] | null;
    onMount: Action;
    onUnmount: Action;
}

export interface VNodeFunctionalComponent extends VNodeBase<FunctionalComponent> {
    type: 'component';
    props: PropsType;
    ref: object | null;
    isMounted: boolean;
    mountedChildrenCount: number;
    onMount: Action;
    onUnmount: Action;
}

export interface VNodeBuiltinComponent extends VNodeBase<FunctionalComponent> {
    type: 'builtin';
    props: PropsType;
    ref: ReactiveNode;
    onUnmount: Action;
}

export interface VNodeObservable extends VNodeBase<Observable<JSXNode>> {
    type: 'observable';
    ref: ReactiveNode;
    onUnmount: Action;
}

export type VNode =
    | VNodeText
    | VNodeElement
    | VNodeFunctionalComponent
    | VNodeBuiltinComponent
    | VNodeObservable;

/* DOM Node */
export type DOMNode = ChildNode | ReactiveNode;

// component types
export type FunctionalComponent = (...args: unknown[]) => JSXNode;

/* props */

// generic props type for the render engine
export type PropsType = Record<string, unknown> & {
    ref?: unknown;
    children?: JSXNode;
};

type ClassProp = `class:${string}`;
type Classes = Record<ClassProp, boolean | Observable<boolean>>;

type CommonProps<T extends Element> =
    & (T extends ElementCSSInlineStyle ? { style?: CSS | string } : object)
    & (T extends HTMLOrSVGElement ? { dataset?: DOMStringMap } : object)
    & Classes
    & {
        ref?: Ref<T>;
        children?: JSXNode;
        class?: string;
    };

/* event types */
type TypedEvent<TElement extends Element, TEvent extends Event = Event> =
    & Omit<TEvent, 'currentTarget'>
    & {
        currentTarget: TElement;
    };

type DOMEvents<T extends Element> = {
    [K in keyof GlobalEventHandlersEventMap as `on:${K}`]?: (
        this: T,
        ev: TypedEvent<T, GlobalEventHandlersEventMap[K]>,
    ) => unknown;
};

/* utilities */
type SettableProps<T extends Element> = Omit<
    T,
    keyof (
        & ReadonlyProps<T>
        & MethodsOf<T>
        & CommonProps<T>
        & GlobalEventHandlers
        & { className: never; classList: never }
    )
>;

type AcceptsObservable<T> =
    | (T extends infer U ? Observable<U> : never)
    | Observable<T>;

type AsAcceptsObservable<T> = {
    [K in keyof T]: T[K] | AcceptsObservable<T[K]>;
};

/* all props */
export type DOMProps<T extends Element> =
    & Partial<AsAcceptsObservable<SettableProps<T>>>
    & CommonProps<T>
    & DOMEvents<T>;

export type SVGProps<T extends SVGElement> =
    & DOMProps<T>
    & Record<string, unknown>; // no validation for svg props for now.

/* helpers */
export type HasVNode<T extends Node> = T & {
    __vNode: VNode;
};
