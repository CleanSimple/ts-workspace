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
function _createElement(tag, props = {}, children = [], isDev = false) {
    const safeChildren = children.flat()
        .filter(child => child !== undefined && child !== null && child !== false);
    if (typeof tag === 'function') {
        return tag({ ...props, children: safeChildren, isDev });
    }
    return { tag, props, children: safeChildren, isDev };
}
function jsx(type, props) {
    let children = props.children ?? [];
    children = Array.isArray(children) ? children : [children];
    delete props.children;
    return _createElement(type, props, children, false);
}
function jsxDEV(type, props) {
    let children = props.children ?? [];
    children = Array.isArray(children) ? children : [children];
    delete props.children;
    return _createElement(type, props, children, true);
}
function createElement(tag, props, ...children) {
    return _createElement(tag, props, children);
}
function renderElement(element, isSvgContext = false) {
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
function appendChildren(elem, children, isSvgContext) {
    children.forEach(child => {
        if (typeof child == 'object') {
            elem.appendChild(renderElement(child, isSvgContext));
        }
        else {
            elem.appendChild(document.createTextNode(String(child)));
        }
    });
}

export { Fragment, createElement, jsx, jsxDEV, jsx as jsxs, renderElement };
