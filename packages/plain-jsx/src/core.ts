import { hasKey, isKeyReadonly } from '@lib/utils';
import { setCurrentInstance } from './hooks';
import { Ref } from './ref';
import type { DOMProps, FunctionalComponent, SVGProps, VNode, VNodeChildren } from './types';

export const Fragment = 'Fragment';

export function createVNode(
    type: string | FunctionalComponent,
    props: object = {},
    children: VNode[] = [],
    isDev = false,
): VNode {
    return { type, props, children, mountedHooks: [], isDev };
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

    const renderChildren = (node: Element | DocumentFragment, children: VNode[], isSvg: boolean) =>
        children.flat().forEach(child => _render(node, child, isSvg));

    const { type, props, children } = element;
    if (typeof type === 'function') {
        const rest = setCurrentInstance(element);
        try {
            const vNode = type({ ...props, children });
            _render(root, vNode, isSvgContext);
            element.mountedHooks.forEach(mountedHook => mountedHook());
        }
        finally {
            rest();
        }
    }
    else if (type === Fragment) {
        // renderChildren(root, children);
        const fragment = document.createDocumentFragment();
        renderChildren(fragment, children, isSvgContext);
        root.appendChild(fragment);
    }
    else {
        const isSvg = isSvgContext || type === 'svg';

        const elem = isSvg
            ? document.createElementNS('http://www.w3.org/2000/svg', type)
            : document.createElement(type);
        if (props) {
            setProps(elem, props, isSvg);
        }
        renderChildren(elem, children, isSvg);
        root.appendChild(elem);
    }
}

function setProps<T extends HTMLElement | SVGElement>(
    elem: T,
    props: object,
    isSvg: boolean,
) {
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'ref' && value instanceof Ref) {
            value.setCurrent(elem);
        }
        else if (key === 'style' && value instanceof Object) {
            Object.assign(elem.style, value);
        }
        else if (key === 'dataset' && value instanceof Object) {
            Object.assign(elem.dataset, value);
        }
        else if (/^on[A-Z]/.exec(key)) {
            elem.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
        }
        else if (hasKey(elem, key) && !isKeyReadonly(elem, key)) {
            Object.assign(elem, { [key]: value as unknown });
        }
        else {
            if (isSvg) {
                elem.setAttributeNS(null, key, String(value));
            }
            else {
                elem.setAttribute(key, String(value));
            }
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
