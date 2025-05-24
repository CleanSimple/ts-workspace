import type { MethodsOf, ReadonlyProps } from '@lib/utils';
import type { Properties as CSS } from 'csstype';
import type { Ref } from './ref';

/* common custom props */
type CommonProps<T extends Element> =
    & (T extends ElementCSSInlineStyle ? { style?: CSS } : object)
    & (T extends HTMLOrSVGElement ? { dataset?: DOMStringMap } : object)
    & {
        ref?: Ref;
        children?: unknown;
    };

/* utilities */
type SettableProps<T extends Element> = Omit<
    T,
    keyof (ReadonlyProps<T> & MethodsOf<T> & CommonProps<T> & GlobalEventHandlers)
>;

/* event types */
type TypedEvent<TElement extends Element, TEvent extends Event = Event> =
    & Omit<TEvent, 'currentTarget'>
    & {
        currentTarget: TElement;
    };

type DOMEvents<T extends Element> = {
    [K in keyof GlobalEventHandlersEventMap as `on${Capitalize<K>}`]?: (
        this: T,
        ev: TypedEvent<T, GlobalEventHandlersEventMap[K]>,
    ) => unknown;
};

/* all props */
export type DOMProps<T extends Element> =
    & Partial<SettableProps<T>>
    & CommonProps<T>
    & DOMEvents<T>;

// no validation for svg props for now.
export type SVGProps<T extends SVGElement> =
    & DOMProps<T>
    & Record<string, string>;

/* vnode */
export interface VNodeElement {
    type: string;
    props: object | undefined;
    children: VNode[];
    isDev: boolean;
}

export type VNode = VNodeElement | string | number | boolean | null | undefined;
export type VNodeChildren = VNode | VNode[];
export type FunctionalComponent = (props: object) => VNode;
