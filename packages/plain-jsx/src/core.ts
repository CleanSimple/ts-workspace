import { hasKey, isKeyReadonly } from '@lib/utils';
import type { DOMProps, FunctionalComponent, SVGProps, VNode, VNodeChildren } from './types';

export const Fragment = 'Fragment';

export function createVNode(
    type: string | FunctionalComponent,
    props: object = {},
    children: VNode[] = [],
    isDev = false,
): VNode {
    if (typeof type === 'function') {
        return type({ ...props, children });
    }
    return { type, props, children, isDev };
}

export function jsx(
    type: string | FunctionalComponent,
    props: { children?: VNodeChildren },
): VNode {
    let children = props.children ?? [];
    children = Array.isArray(children) ? children : [children];
    delete props.children;
    return createVNode(type, props, children, false);
}

export { jsx as jsxs };

export function jsxDEV(
    type: string | FunctionalComponent,
    props: { children?: VNodeChildren },
) {
    let children = props.children ?? [];
    children = Array.isArray(children) ? children : [children];
    delete props.children;
    return createVNode(type, props, children, true);
}

export function createElement(
    tag: string | FunctionalComponent,
    props?: object,
    ...children: VNode[]
): VNode {
    return createVNode(tag, props, children);
}

export function render(root: Element | DocumentFragment, element: VNode) {
    return _render(root, element);
}

function _render(root: Element | DocumentFragment, element: VNode, isSvgContext = false) {
    if (element === undefined || element === null || typeof element === 'boolean') {
        return;
    }
    else if (typeof element === 'string' || typeof element === 'number') {
        root.appendChild(document.createTextNode(String(element)));
        return;
    }

    const renderChildren = (node: Element | DocumentFragment, children: VNode[]) =>
        children.flat().forEach(child => _render(node, child, isSvgContext));

    const { type, props, children } = element;
    if (type === Fragment) {
        // renderChildren(root, children);
        const fragment = document.createDocumentFragment();
        renderChildren(fragment, children);
        root.appendChild(fragment);
        return;
    }

    const isSvg = isSvgContext || type === 'svg';

    const elem = isSvg
        ? document.createElementNS('http://www.w3.org/2000/svg', type)
        : document.createElement(type);
    if (props) {
        setProps(elem, props);
    }
    renderChildren(elem, children);

    root.appendChild(elem);
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

type DOMElement = Element;
type DOMElementTagsMap = HTMLElementTagNameMap & SVGElementTagNameMap;

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace JSX {
    /* utility */
    type PropsOf<T extends DOMElement> = T extends SVGElement ? SVGProps<T> : DOMProps<T>;

    /* jsx defs */
    interface ElementAttributesProperty {
        props: unknown;
    }

    interface ElementChildrenAttribute {
        children?: unknown;
    }

    type Fragment = typeof Fragment;

    type Element = VNode;

    type BaseIntrinsicElements = {
        [K in keyof DOMElementTagsMap]: PropsOf<DOMElementTagsMap[K]>;
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends BaseIntrinsicElements {
        // allow extending
    }
}
