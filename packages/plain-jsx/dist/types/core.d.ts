import type { FunctionalComponent, PropsOf, SupportedElements, VNode, VNodeChildren } from './types';
export declare const Fragment = "Fragment";
export declare function createVNode(type: string | FunctionalComponent, props?: object, children?: VNode[], isDev?: boolean): VNode;
export declare function jsx(type: string | FunctionalComponent, props: {
    children?: VNodeChildren;
}): VNode;
export { jsx as jsxs };
export declare function jsxDEV(type: string | FunctionalComponent, props: {
    children?: VNodeChildren;
}): VNode;
export declare function createElement(tag: string | FunctionalComponent, props?: object, ...children: VNode[]): VNode;
export declare function render(root: Element | DocumentFragment, element: VNode): void;
export declare namespace JSX {
    interface ElementAttributesProperty {
        props: unknown;
    }
    interface ElementChildrenAttribute {
        children?: unknown;
    }
    type Fragment = typeof Fragment;
    type Element = VNode;
    type IntrinsicElements = {
        [K in keyof SupportedElements]: PropsOf<SupportedElements[K]>;
    };
}
