import { hasKey, isKeyReadonly } from '@lib/utils';
import { LifecycleEvents } from './events.esm.js';

const XMLNamespaces = {
    'svg': 'http://www.w3.org/2000/svg',
};
const Fragment = 'Fragment';
function createVNode(type, props = {}, children = [], isDev = false) {
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
async function render(root, element, handlers) {
    const events = new LifecycleEvents();
    const refs = {};
    if (element && typeof element === 'object') {
        element.props['ref'] = 'default';
        events.onMounted(() => handlers.onMounted(refs.default));
    }
    const node = await renderVNode(root, element, events, refs);
    if (node === null) {
        return;
    }
    events.listen(node);
    root.appendChild(node);
}
async function renderVNode(root, element, events, refs) {
    if (element === undefined || element === null || typeof element === 'boolean') {
        return null;
    }
    else if (typeof element === 'string' || typeof element === 'number') {
        return document.createTextNode(String(element));
    }
    const renderChildren = async (node, children) => {
        const childNodes = await Promise.all(children.flat().map(async (child) => renderVNode(node, child, events, refs)));
        node.append(...childNodes.filter(node => node !== null));
    };
    const { type, props, children } = element;
    if (typeof type === 'function') {
        return await renderFunctionalComponent(root, type, props, children, events, refs);
    }
    else if (type === Fragment) {
        const fragment = document.createDocumentFragment();
        await renderChildren(fragment, children);
        return fragment;
    }
    else {
        const hasNS = type.includes(':');
        const domElement = hasNS
            ? document.createElementNS(...splitNamespace(type))
            : document.createElement(type);
        // handle ref prop
        if ('ref' in props && typeof props['ref'] === 'string') {
            if (refs) {
                refs[props['ref']] = domElement;
            }
            delete props['ref'];
        }
        setProps(domElement, props);
        await renderChildren(domElement, children);
        return domElement;
    }
}
async function renderFunctionalComponent(root, type, props, children, events, refs) {
    const componentRefs = {};
    const utils = {
        getRef: (key) => {
            if (key in componentRefs === false) {
                throw new Error(`Invalid ref key: ${key}`);
            }
            return componentRefs[key];
        },
        defineRef: (ref) => {
            if ('ref' in props && typeof props['ref'] === 'string') {
                if (refs) {
                    refs[props['ref']] = ref;
                }
            }
        },
    };
    const setupHandlers = [];
    const errorCapturedHandlers = [];
    const componentEvents = {
        onSetup: (handler) => setupHandlers.push(handler),
        onMounted: (handler) => events.onMounted(() => handler(utils)),
        onReady: (handler) => events.onReady(handler),
        onRendered: (handler) => events.onRendered(handler),
        onErrorCaptured: (handler) => errorCapturedHandlers.push(handler),
    };
    let node = null;
    events.pushLevel();
    try {
        const vNode = type({ ...props, children }, componentEvents);
        await Promise.all(setupHandlers.map((setupHandler) => setupHandler()));
        node = await renderVNode(root, vNode, events, componentRefs);
    }
    catch (error) {
        const handled = errorCapturedHandlers.some(errorCapturedHandler => errorCapturedHandler(error) === false);
        if (!handled) {
            throw error;
        }
    }
    finally {
        events.popLevel();
    }
    return node;
}
function setProps(elem, props) {
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'style' && value instanceof Object) {
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
            if (key.includes(':')) {
                elem.setAttributeNS(splitNamespace(key)[0], key, String(value));
            }
            else {
                elem.setAttribute(key, String(value));
            }
        }
    });
}
function splitNamespace(tagNS) {
    const [ns, tag] = tagNS.split(':', 1);
    if (!hasKey(XMLNamespaces, ns)) {
        throw new Error('Invalid namespace');
    }
    return [XMLNamespaces[ns], tag];
}

export { Fragment, createElement, createVNode, jsx, jsxDEV, jsx as jsxs, render };
