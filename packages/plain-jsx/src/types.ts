import type { Observable, Subscription } from '@cleansimple/observable';
import type { Properties as CSS } from 'csstype';
import type { ReactiveNode } from './reactive-node';
import type { Ref } from './ref';

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
export interface VNodeBase {
    type: 'root' | 'text' | 'element' | 'component' | 'builtin' | 'observable';
    parent: VNode | null;
    firstChild: VNode | null; // head
    lastChild: VNode | null; // tail
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
    cleanup: () => void;
}

export interface VNodeFunctionalComponent extends VNodeBase {
    type: 'component';
    ref: object | null;
    cleanup: () => void;
}

export interface VNodeBuiltinComponent extends VNodeBase {
    type: 'builtin';
    ref: ReactiveNode;
    cleanup: () => void;
}

export interface VNodeObservable extends VNodeBase {
    type: 'observable';
    ref: ReactiveNode;
    cleanup: () => void;
}

export type VNode =
    | VNodeRoot
    | VNodeText
    | VNodeElement
    | VNodeFunctionalComponent
    | VNodeBuiltinComponent
    | VNodeObservable;

/* Rendered Node */
export type RNode = ChildNode | ReactiveNode;

/* DOM Node */
export type DOMNode = ChildNode;

// component types
export type FunctionalComponent<TProps = object, TRef extends object = object> = (
    props: TProps & { ref?: Ref<TRef> },
    helpers: {
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
        defineRef: (ref: TRef) => void;
    },
) => JSXNode;

/* props */

// generic props type for the render engine
export type PropsType = Record<string, unknown> & {
    ref?: Ref<object>;
    children?: JSXNode;
};

type Classes = Record<`class:${string}`, boolean | Observable<boolean>>;

type CommonProps<T extends Element> =
    & Classes
    & {
        ref?: Ref<T>;
        children?: JSXNode;
        class?: string;
        style?: CSS | string;
        dataset?: DOMStringMap;
    };

type SettableProps<T extends Element> = Omit<
    T,
    | keyof (
        & ReadonlyProps<T>
        & MethodsOf<T>
        & CommonProps<T>
        & GlobalEventHandlers
    )
    | 'className'
    | 'classList'
>;

/* event types */
type TypedEvent<TElement extends Element, TEvent extends Event = Event> =
    & TEvent
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

/* ------------------------------
 * General type utilities
 * ------------------------------ */
export type Predicate<T> = (value: T) => boolean;
export type Action<T = void> = [T] extends [void] ? () => void : (arg: T) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunc = (...args: any[]) => any;

export type IfEquals<X, Y, A, B = never> = (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;

export type IsReadonly<T, K extends keyof T> = IfEquals<
    { [P in K]: T[P] },
    { -readonly [P in K]: T[P] },
    false,
    true
>;

/** Note: Does not match setters/getters */
export type MethodsOf<T> = {
    [K in keyof T as T[K] extends AnyFunc ? K : never]: T[K];
};

/** Note: Does not match setter-only properties */
export type ReadonlyProps<T> = {
    [K in keyof T as IsReadonly<T, K> extends true ? K : never]: T[K];
};
