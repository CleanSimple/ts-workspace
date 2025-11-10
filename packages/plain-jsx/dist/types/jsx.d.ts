import type { Fragment } from './components/Fragment';
import type { DOMProps, FunctionalComponent, JSXElement, JSXNode, PropsType, SVGProps } from './types';
export declare function jsx(type: string | FunctionalComponent, props: PropsType): JSXElement;
export { jsx as jsxDEV, jsx as jsxs };
export declare namespace JSX {
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
