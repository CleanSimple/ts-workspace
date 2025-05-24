import { hasKey, isKeyReadonly } from '@lib/utils';
import { setCurrentInstance } from './hooks.esm.js';
import { Ref } from './ref.esm.js';

const Fragment = 'Fragment';
function createVNode(type, props = {}, children = [], isDev = false) {
    return { type, props, children, mountedHooks: [], isDev };
}
function jsx(type, props) {
    let children = props.children ?? [];
    children = Array.isArray(children) ? children : [children];
    delete props.children;
    return createVNode(type, props, children, false);
}
function jsxDEV(type, props) {
    let children = props.children ?? [];
    children = Array.isArray(children) ? children : [children];
    delete props.children;
    return createVNode(type, props, children, true);
}
function createElement(tag, props, ...children) {
    return createVNode(tag, props, children);
}
function render(root, element) {
    return _render(root, element);
}
function _render(root, element, isSvgContext = false) {
    if (element === undefined || element === null || typeof element === 'boolean') {
        return;
    }
    else if (typeof element === 'string' || typeof element === 'number') {
        root.appendChild(document.createTextNode(String(element)));
        return;
    }
    const renderChildren = (node, children, isSvg) => children.flat().forEach(child => _render(node, child, isSvg));
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
function setProps(elem, props, isSvg) {
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
            elem.addEventListener(key.slice(2).toLowerCase(), value);
        }
        else if (hasKey(elem, key) && !isKeyReadonly(elem, key)) {
            Object.assign(elem, { [key]: value });
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

export { Fragment, createElement, createVNode, jsx, jsxDEV, jsx as jsxs, render };
