import type { Fragment } from './components/Fragment';
import type {
    DOMProps,
    FunctionalComponent,
    JSXElement,
    JSXNode,
    PropsType,
    SVGProps,
} from './types';

export function jsx(type: string | FunctionalComponent, props: PropsType): JSXElement {
    return { type, props };
}

export { jsx as jsxDEV, jsx as jsxs };

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace JSX {
    /* jsx defs */
    type Fragment = typeof Fragment;

    type Element = JSXNode;

    type BaseIntrinsicElements =
        & {
            [K in keyof HTMLElementTagNameMap]: DOMProps<HTMLElementTagNameMap[K]>;
        }
        & {
            [K in keyof SVGElementTagNameMap as `svg:${K}`]: SVGProps<SVGElementTagNameMap[K]>;
        };

    interface IntrinsicElements extends BaseIntrinsicElements {
        // allow extending the intrinsic elements
    }
}
