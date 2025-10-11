import type { DOMProps, FunctionalComponent, JSXElement, JSXNode, PropsType, SVGProps } from './types';
export declare const Fragment = "Fragment";
export declare function jsx(type: string | FunctionalComponent, props: PropsType): JSXElement;
export { jsx as jsxDEV, jsx as jsxs };
export declare function render(root: Element | DocumentFragment, jsxNode: JSXNode): void;
type DOMElement = Element;
export declare namespace JSX {
    type PropsOf<T extends DOMElement> = T extends SVGElement ? SVGProps<T> : DOMProps<T>;
    type Fragment = typeof Fragment;
    type Element = JSXNode;
    type BaseIntrinsicElements = {
        [K in keyof HTMLElementTagNameMap]: PropsOf<HTMLElementTagNameMap[K]>;
    } & {
        [K in keyof SVGElementTagNameMap as `svg:${K}`]: PropsOf<SVGElementTagNameMap[K]>;
    };
    interface IntrinsicElements extends BaseIntrinsicElements {
    }
}
