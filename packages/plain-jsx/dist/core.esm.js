function hasKey(obj, key) {
    return key in obj;
}
function isKeyReadonly(obj, key) {
    let currentObj = obj;
    while (currentObj !== null) {
        const desc = Object.getOwnPropertyDescriptor(currentObj, key);
        if (desc) {
            return desc.writable === false || desc.set === undefined;
        }
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return true;
}

const Fragment = 'Fragment';
function createVNode(type, props = {}, children = [], isDev = false) {
    if (typeof type === 'function') {
        return type({ ...props, children });
    }
    return { type, props, children, isDev };
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
    const renderChildren = (node, children) => children.flat().forEach(child => _render(node, child, isSvgContext));
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
function setProps(elem, props) {
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'style' && value instanceof Object) {
            Object.assign(elem.style, value);
        }
        else if (key === 'dataset' && value instanceof Object) {
            Object.assign(elem.dataset, value);
        }
        else if (hasKey(elem, key) && !isKeyReadonly(elem, key)) {
            Object.assign(elem, { [key]: value });
        }
        else {
            elem.setAttribute(key, String(value));
        }
    });
}

export { Fragment, createElement, createVNode, jsx, jsxDEV, jsx as jsxs, render };
