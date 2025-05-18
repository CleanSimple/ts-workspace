import type { PropsOf, SupportedElements } from './types';
interface JSXElement {
    tag: string;
    props: object | undefined;
    children: JSXChild[];
    isDev: boolean;
}
type JSXChild = JSXElement | string | number | true;
type Child = JSXElement | string | number | boolean | null | undefined;
type FunctionalComponent = (props: object) => JSXElement;
export declare const Fragment = "Fragment";
export declare function jsx(type: string | FunctionalComponent, props: {
    children?: Child[] | Child;
}): JSXElement;
export { jsx as jsxs };
export declare function jsxDEV(type: string | FunctionalComponent, props: {
    children?: Child[] | Child;
}): JSXElement;
export declare function createElement(tag: string | FunctionalComponent, props?: object, ...children: Child[]): JSXElement;
export declare function renderElement(element: JSXElement, isSvgContext?: boolean): DocumentFragment | SVGElement | HTMLElement;
export declare namespace JSX {
    interface ElementAttributesProperty {
        props: unknown;
    }
    interface ElementChildrenAttribute {
        children?: unknown;
    }
    type Fragment = typeof Fragment;
    type Element = JSXElement;
    type IntrinsicElements = {
        [K in keyof SupportedElements]: PropsOf<SupportedElements[K]>;
    };
}
