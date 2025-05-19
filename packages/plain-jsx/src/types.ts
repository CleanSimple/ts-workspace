import type { MethodsOf, ReadonlyProps } from '@lib/utils';
import type { Properties as CSS } from 'csstype';

/* props */
type CommonProps<T> =
    & (T extends ElementCSSInlineStyle ? { style?: CSS } : object)
    & (T extends HTMLOrSVGElement ? { dataset?: DOMStringMap } : object)
    & {
        children?: unknown;
    };

/* utilities */
type SettableProps<T> = Omit<
    T,
    keyof (ReadonlyProps<T> & MethodsOf<T> & CommonProps<T>)
>;

export type DOMProps<T extends Element> =
    & Partial<SettableProps<T>>
    & CommonProps<T>;

// no validation for svg props for now.
export type SVGProps<T extends SVGElement> =
    & Partial<SettableProps<T>>
    & CommonProps<T>
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
