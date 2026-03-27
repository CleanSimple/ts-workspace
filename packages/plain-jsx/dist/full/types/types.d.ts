import { Signal } from '@cleansimple/plain-signals';
import { Properties } from 'csstype';
import { Ref } from './ref.js';

type JSXNode = Signal<JSXNode> | JSXElement | string | number | boolean | bigint | null | undefined | JSXNode[];
interface JSXElement {
    type: string | FunctionalComponent;
    props: PropsType;
}
type FunctionalComponent<TProps = object, TRef extends object = object> = (props: TProps & {
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
    defineRef: (ref: TRef) => void;
}) => JSXNode;
type PropsType = Record<string, unknown> & {
    ref?: Ref<object>;
    children?: JSXNode;
};
type Classes = Record<`class:${string}`, boolean | Signal<boolean>>;
type CommonProps<T extends Element> = Classes & {
    ref?: Ref<T>;
    children?: JSXNode;
    class?: string;
    style?: Properties | string;
    dataset?: DOMStringMap;
};
type SettableProps<T extends Element> = Omit<T, keyof (ReadonlyProps<T> & MethodsOf<T> & CommonProps<T> & GlobalEventHandlers) | 'className' | 'classList'>;
type TypedEvent<TElement extends Element, TEvent extends Event = Event> = TEvent & {
    currentTarget: TElement;
};
type DOMEvents<T extends Element> = {
    [K in keyof GlobalEventHandlersEventMap as `on:${K}`]?: (this: T, ev: TypedEvent<T, GlobalEventHandlersEventMap[K]>) => unknown;
};
type AcceptsSignal<T> = (T extends infer U ? Signal<U> : never) | Signal<T>;
type AsAcceptsSignal<T> = {
    [K in keyof T]: T[K] | AcceptsSignal<T[K]>;
};
type DOMProps<T extends Element> = Partial<AsAcceptsSignal<SettableProps<T>>> & CommonProps<T> & DOMEvents<T>;
type SVGProps<T extends SVGElement> = DOMProps<T> & Record<string, unknown>;
type Predicate<T> = (value: T) => boolean;
type Action<T = void> = [T] extends [void] ? () => void : (arg: T) => void;
type AnyFunc = (...args: any[]) => any;
type IfEquals<X, Y, A, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;
type IsReadonly<T, K extends keyof T> = IfEquals<{
    [P in K]: T[P];
}, {
    -readonly [P in K]: T[P];
}, false, true>;
/** Note: Does not match setters/getters */
type MethodsOf<T> = {
    [K in keyof T as T[K] extends AnyFunc ? K : never]: T[K];
};
/** Note: Does not match setter-only properties */
type ReadonlyProps<T> = {
    [K in keyof T as IsReadonly<T, K> extends true ? K : never]: T[K];
};

export type { Action, AnyFunc, DOMProps, FunctionalComponent, IfEquals, IsReadonly, JSXElement, JSXNode, MethodsOf, Predicate, PropsType, ReadonlyProps, SVGProps };
