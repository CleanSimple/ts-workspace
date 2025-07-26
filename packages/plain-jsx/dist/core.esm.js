import { isObject, hasKey } from '@lib/utils';
import { XMLNamespaces } from './namespaces.esm.js';
import { Val, Observable } from './observable.esm.js';
import { Show, renderShow, For, renderFor, ReactiveNode } from './reactive.esm.js';

const Fragment = 'Fragment';
/* built-in components that have special handling */
const BuiltinComponents = new Map([
    [Show, renderShow],
    [For, renderFor],
]);
function jsx(type, props) {
    const { children } = props;
    props.children = undefined;
    return renderVNode(type, props, children);
}
// export let initialRenderDone = false;
function render(root, vNode) {
    root.append(...renderChildren(vNode));
    // initialRenderDone = true;
}
function renderVNode(type, props, children) {
    const renderBuiltin = BuiltinComponents.get(type);
    if (renderBuiltin) {
        return renderBuiltin(props, children, renderChildren);
    }
    /* general handling */
    if (typeof type === 'function') {
        let componentRef = null;
        const defineRef = (ref) => {
            componentRef = ref;
        };
        const vNode = type({ ...props, children }, { defineRef });
        if (props['ref'] instanceof Val) {
            props['ref'].value = componentRef;
        }
        componentRef = null;
        return renderChildren(vNode);
    }
    else if (type === Fragment) {
        return renderChildren(children);
    }
    else {
        const hasNS = type.includes(':');
        const domElement = hasNS
            ? document.createElementNS(...splitNamespace(type))
            : document.createElement(type);
        // handle ref prop
        if (props['ref'] instanceof Val) {
            props['ref'].value = domElement;
            props['ref'] = undefined;
        }
        setProps(domElement, props);
        domElement.append(...renderChildren(children));
        return domElement;
    }
}
function renderChildren(children) {
    const normalizedChildren = Array.isArray(children)
        ? children.flat(10)
        : [children];
    const childNodes = [];
    for (const vNode of normalizedChildren) {
        if (vNode == null || typeof vNode === 'boolean') {
            continue;
        }
        else if (typeof vNode === 'string' || typeof vNode === 'number') {
            childNodes.push(document.createTextNode(String(vNode)));
        }
        else if (vNode instanceof Observable) {
            const reactiveNode = new ReactiveNode();
            let children = renderChildren(vNode.value);
            reactiveNode.update(children);
            vNode.subscribe((value) => {
                if ((typeof value === 'string' || typeof value === 'number')
                    && children instanceof Node && children.nodeType === Node.TEXT_NODE) {
                    // optimized update path for text nodes
                    children.textContent = value.toString();
                }
                else {
                    children = renderChildren(value);
                    reactiveNode.update(children);
                }
            });
            childNodes.push(...reactiveNode.getRoot());
        }
        else {
            childNodes.push(vNode);
        }
    }
    return childNodes;
}
const handledEvents = new Set();
const InputTwoWayProps = ['value', 'valueAsNumber', 'valueAsDate', 'checked', 'files'];
const SelectTwoWayProps = ['value', 'selectedIndex'];
function setProps(elem, props) {
    const elemObj = elem;
    let elemRef = null;
    if ('style' in props) {
        const value = props['style'];
        props['style'] = undefined;
        if (isObject(value)) {
            Object.assign(elem.style, value);
        }
        else if (typeof value === 'string') {
            elem.setAttribute('style', value);
        }
        else {
            throw new Error("Invalid value type for 'style' prop.");
        }
    }
    else if ('dataset' in props) {
        const value = props['dataset'];
        props['dataset'] = undefined;
        if (!isObject(value)) {
            throw new Error('Dataset value must be an object');
        }
        Object.assign(elem.dataset, value);
    }
    // handle class prop early so it doesn't overwrite class:* props
    else if ('class' in props) {
        const value = props['class'];
        props['class'] = undefined;
        elem.className = value;
    }
    for (const key in props) {
        const value = props[key];
        if (value === undefined) {
            continue;
        }
        if (key.startsWith('class:')) {
            const className = key.slice(6);
            if (value instanceof Observable) {
                value.subscribe((value) => {
                    if (value) {
                        elem.classList.add(className);
                    }
                    else {
                        elem.classList.remove(className);
                    }
                });
                if (value.value) {
                    elem.classList.add(className);
                }
            }
            else {
                if (value) {
                    elem.classList.add(className);
                }
            }
        }
        else if (key.startsWith('on:')) {
            const event = key.slice(3);
            elemObj[`@@${event}`] = value;
            if (!handledEvents.has(event)) {
                handledEvents.add(event);
                document.addEventListener(event, globalEventHandler);
            }
        }
        else if (hasKey(elem, key) && !isReadonlyProp(elem, key)) {
            if (value instanceof Observable) {
                elemRef ??= new WeakRef(elemObj);
                const unsubscribe = value.subscribe((value) => {
                    const elem = elemRef.deref();
                    if (!elem) {
                        unsubscribe.unsubscribe();
                        return;
                    }
                    elem[key] = value;
                });
                // two way updates for input element
                if ((elem instanceof HTMLInputElement && InputTwoWayProps.includes(key))
                    || (elem instanceof HTMLSelectElement && SelectTwoWayProps.includes(key))) {
                    if (value instanceof Val) {
                        elem.addEventListener('change', (e) => {
                            value.value = e.target[key];
                        });
                    }
                    else {
                        elem.addEventListener('change', (e) => {
                            e.preventDefault();
                            e.target[key] = value.value;
                        });
                    }
                }
                elemObj[key] = value.value;
            }
            else {
                elemObj[key] = value;
            }
        }
        else {
            if (key.includes(':')) {
                elem.setAttributeNS(splitNamespace(key)[0], key, value);
            }
            else {
                elem.setAttribute(key, value);
            }
        }
    }
}
function splitNamespace(tagNS) {
    const [ns, tag] = tagNS.split(':', 2);
    if (!hasKey(XMLNamespaces, ns)) {
        throw new Error('Invalid namespace');
    }
    return [XMLNamespaces[ns], tag];
}
function isReadonlyProp(obj, key) {
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
function globalEventHandler(evt) {
    const key = `@@${evt.type}`;
    let node = evt.target;
    while (node) {
        const handler = node[key];
        if (handler) {
            return handler.call(node, evt);
        }
        node = node.parentNode;
    }
}

export { Fragment, isReadonlyProp, jsx, jsx as jsxDEV, jsx as jsxs, render };
