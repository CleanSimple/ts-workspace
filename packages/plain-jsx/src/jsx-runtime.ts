import { hasKey, isKeyReadonly } from '@lib/utils';
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

export const Fragment = 'Fragment';

function _createElement(
    tag: string | FunctionalComponent,
    props: object = {},
    children: Child[] = [],
    isDev = false,
): JSXElement {
    const safeChildren = children.flat()
        .filter(child => child !== undefined && child !== null && child !== false);
    if (typeof tag === 'function') {
        return tag({ ...props, children: safeChildren, isDev });
    }
    return { tag, props, children: safeChildren, isDev };
}

export function jsx(
    type: string | FunctionalComponent,
    props: { children?: Child[] | Child },
) {
    let children = props.children ?? [];
    children = Array.isArray(children) ? children : [children];
    delete props.children;
    return _createElement(type, props, children, false);
}

export { jsx as jsxs };

export function jsxDEV(
    type: string | FunctionalComponent,
    props: { children?: Child[] | Child },
) {
    let children = props.children ?? [];
    children = Array.isArray(children) ? children : [children];
    delete props.children;
    return _createElement(type, props, children, true);
}

export function createElement(
    tag: string | FunctionalComponent,
    props?: object,
    ...children: Child[]
): JSXElement {
    return _createElement(tag, props, children);
}

export function renderElement(element: JSXElement, isSvgContext = false) {
    const { tag, props, children } = element;
    // console.info(tag, props, children);
    if (tag === Fragment) {
        const fragment = document.createDocumentFragment();
        appendChildren(fragment, children, isSvgContext);
        return fragment;
    }

    const isSvg = isSvgContext || tag === 'svg';

    const elem = isSvg
        ? document.createElementNS('http://www.w3.org/2000/svg', tag)
        : document.createElement(tag);
    if (props) {
        setProps(elem, props);
    }
    appendChildren(elem, children, isSvg);
    return elem;
}

function setProps<T extends HTMLElement | SVGElement>(elem: T, props: object) {
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'style' && value instanceof Object) {
            Object.assign(elem.style, value);
        }
        else if (key === 'dataset' && value instanceof Object) {
            Object.assign(elem.dataset, value);
        }
        else if (hasKey(elem, key) && !isKeyReadonly(elem, key)) {
            Object.assign(elem, { [key]: value as unknown });
        }
        else {
            elem.setAttribute(key, String(value));
        }
    });
}

function appendChildren(
    elem: Element | DocumentFragment,
    children: JSXChild[],
    isSvgContext: boolean,
) {
    children.forEach(child => {
        if (typeof child == 'object') {
            elem.appendChild(renderElement(child, isSvgContext));
        }
        else {
            elem.appendChild(document.createTextNode(String(child)));
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace JSX {
    export interface ElementAttributesProperty {
        props: unknown;
    }

    export interface ElementChildrenAttribute {
        children?: unknown;
    }

    export type Fragment = typeof Fragment;

    export type Element = JSXElement;

    export type IntrinsicElements = {
        [K in keyof SupportedElements]: PropsOf<SupportedElements[K]>;
    };
}
