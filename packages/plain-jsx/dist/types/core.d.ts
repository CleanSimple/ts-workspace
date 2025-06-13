import type { ShowProps } from './reactive';
import { Show } from './reactive';
import type { DOMProps, FunctionalComponent, RNode, SVGProps, VNode, VNodeChildren } from './types';
export declare const Fragment = "Fragment";
export declare function jsx(type: string | FunctionalComponent, props: {
    children?: VNodeChildren;
}): RNode;
export { jsx as jsxDEV, jsx as jsxs };
export declare function render(root: Element | DocumentFragment, vNode: VNode): void;
export declare function isReadonlyProp<T>(obj: T, key: keyof T): boolean;
type DOMElement = Element;
export declare namespace JSX {
    type PropsOf<T extends DOMElement> = T extends SVGElement ? SVGProps<T> : DOMProps<T>;
    type Fragment = typeof Fragment;
    type Element = VNode;
    type BaseIntrinsicElements = {
        [K in keyof HTMLElementTagNameMap]: PropsOf<HTMLElementTagNameMap[K]>;
    } & {
        [K in keyof SVGElementTagNameMap as `svg:${K}`]: PropsOf<SVGElementTagNameMap[K]>;
    };
    interface IntrinsicElements extends BaseIntrinsicElements {
        [Show]: ShowProps;
    }
}
