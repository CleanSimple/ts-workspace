import { JSXNode, DOMProps, SVGProps, FunctionalComponent, PropsType, JSXElement } from './types.js';

declare function jsx(type: string | FunctionalComponent, props: PropsType): JSXElement;

declare namespace JSX {
    type Fragment = typeof Fragment;
    type Element = JSXNode;
    type BaseIntrinsicElements = {
        [K in keyof HTMLElementTagNameMap]: DOMProps<HTMLElementTagNameMap[K]>;
    } & {
        [K in keyof SVGElementTagNameMap as `svg:${K}`]: SVGProps<SVGElementTagNameMap[K]>;
    };
    interface IntrinsicElements extends BaseIntrinsicElements {
    }
}

export { JSX, jsx, jsx as jsxDEV, jsx as jsxs };
