import { MultiEntryCache } from './cache.esm.js';
import { For } from './components/For.esm.js';
import { Show } from './components/Show.esm.js';
import { patchNode, setProps, observeProps } from './dom.esm.js';
import { mountNodes } from './lifecycle-events.esm.js';
import { ObservableImpl, ValImpl, val } from './observable.esm.js';
import { resolveReactiveNodes, ReactiveNode } from './reactive-node.esm.js';
import { runAsync } from './scheduling.esm.js';
import { splitNamespace } from './utils.esm.js';

const Fragment = 'Fragment';
function jsx(type, props) {
    return { type, props };
}
// export let initialRenderDone = false;
function render(root, jsxNode) {
    const children = resolveReactiveNodes(renderJSX(jsxNode, null));
    root.append(...children);
    mountNodes(children);
    // initialRenderDone = true;
}
function appendVNodeChild(parent, vNode) {
    if (!parent)
        return;
    if (parent.lastChild) {
        parent.lastChild.next = vNode;
        parent.lastChild = vNode;
    }
    else {
        parent.firstChild = parent.lastChild = vNode;
    }
}
function renderJSX(jsxNode, parent, domNodes = []) {
    const nodes = [];
    nodes.push(jsxNode);
    while (nodes.length > 0) {
        const node = nodes.shift();
        // skip null, undefined and boolean
        if (node == null || typeof node === 'boolean') {
            continue;
        }
        // flatten arrays
        if (Array.isArray(node)) {
            nodes.unshift(...node);
            continue;
        }
        // flatten fragments
        if (typeof node === 'object' && 'type' in node && node.type === Fragment) {
            if (Array.isArray(node.props.children)) {
                nodes.unshift(...node.props.children);
            }
            else {
                nodes.unshift(node.props.children);
            }
            continue;
        }
        if (typeof node === 'string' || typeof node === 'number') {
            const textNode = document.createTextNode(String(node));
            if (parent?.type !== 'element') {
                const vNode = new _VNodeText(textNode, node, parent);
                patchNode(textNode, vNode);
                appendVNodeChild(parent, vNode);
            }
            domNodes.push(textNode);
        }
        else if (node instanceof ObservableImpl) {
            const reactiveNode = new ReactiveNode();
            const vNode = new _VNodeObservable(reactiveNode, node, parent);
            appendVNodeChild(parent, vNode);
            domNodes.push(reactiveNode);
        }
        else if ('type' in node) {
            if (typeof node.type === 'string') {
                const hasNS = node.type.includes(':');
                const domElement = hasNS
                    ? document.createElementNS(...splitNamespace(node.type))
                    : document.createElement(node.type);
                setProps(domElement, node.props);
                if (parent?.type === 'element') {
                    const subscriptions = observeProps(domElement, node.props);
                    if (subscriptions) {
                        if (parent.subscriptions) {
                            parent.subscriptions.push(...subscriptions);
                        }
                        else {
                            parent.subscriptions = subscriptions;
                        }
                    }
                    const children = renderJSX(node.props.children, parent);
                    domElement.append(...resolveReactiveNodes(children));
                }
                else {
                    const vNode = new _VNodeElement(domElement, node.type, node.props, parent);
                    vNode.subscriptions = observeProps(domElement, node.props);
                    patchNode(domElement, vNode);
                    appendVNodeChild(parent, vNode);
                    const children = renderJSX(node.props.children, vNode);
                    domElement.append(...resolveReactiveNodes(children));
                }
                domNodes.push(domElement);
            }
            else if (node.type === For) {
                const reactiveNode = new ReactiveNode();
                const vNode = new _VNodeFor(reactiveNode, node.props, parent);
                appendVNodeChild(parent, vNode);
                domNodes.push(reactiveNode);
            }
            else if (node.type === Show) {
                const reactiveNode = new ReactiveNode();
                const vNode = new _VNodeShow(reactiveNode, node.props, parent);
                appendVNodeChild(parent, vNode);
                domNodes.push(reactiveNode);
            }
            else if (typeof node.type === 'function') {
                const vNode = new _VNodeFunctionalComponent(node.type, node.props, parent);
                const defineRef = (ref) => {
                    vNode.ref = ref;
                };
                const onMount = (fn) => {
                    vNode.onMountCallback = fn;
                };
                const onUnmount = (fn) => {
                    vNode.onUnmountCallback = fn;
                };
                const jsxNode = vNode.value(vNode.props, { defineRef, onMount, onUnmount });
                appendVNodeChild(parent, vNode);
                renderJSX(jsxNode, vNode, domNodes);
            }
            else {
                throw new Error('Invalid JSX node');
            }
        }
        else {
            throw new Error('Invalid JSX node');
        }
    }
    return domNodes;
}
function resolveRenderedVNodes(vNodes, childNodes = []) {
    let vNode = vNodes;
    while (vNode) {
        if (vNode.type === 'text') {
            childNodes.push(vNode.ref);
        }
        else if (vNode.type === 'observable') {
            childNodes.push(vNode.ref);
        }
        else if (vNode.type === 'element') {
            childNodes.push(vNode.ref);
        }
        else if (vNode.type === 'component' && vNode.firstChild) {
            resolveRenderedVNodes(vNode.firstChild, childNodes);
        }
        else if (vNode.type === 'builtin') {
            childNodes.push(vNode.ref);
        }
        vNode = vNode.next;
    }
    return childNodes;
}
class _VNodeText {
    type;
    value;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    constructor(ref, value, parent) {
        this.type = 'text';
        this.value = value;
        this.parent = parent;
        this.ref = ref;
    }
}
class _VNodeFunctionalComponent {
    type;
    value;
    props;
    ref = null;
    isMounted = false;
    mountedChildrenCount = 0;
    onMountCallback = null;
    onUnmountCallback = null;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    constructor(value, props, parent) {
        this.type = 'component';
        this.value = value;
        this.props = props;
        this.parent = parent;
    }
    onMount() {
        if (this.props.ref instanceof ValImpl) {
            this.props.ref.value = this.ref;
        }
        if (this.onMountCallback) {
            runAsync(this.onMountCallback);
        }
        this.isMounted = true;
    }
    onUnmount() {
        if (this.onUnmountCallback) {
            runAsync(this.onUnmountCallback);
        }
        if (this.props.ref instanceof ValImpl) {
            this.props.ref.value = null;
        }
        this.mountedChildrenCount = 0; // for when forcing an unmount
        this.isMounted = false;
    }
}
class _VNodeElement {
    type;
    value;
    props;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    subscriptions = null;
    constructor(ref, value, props, parent) {
        this.type = 'element';
        this.value = value;
        this.props = props;
        this.parent = parent;
        this.ref = ref;
    }
    onMount() {
        if (this.props.ref instanceof ValImpl) {
            this.props.ref.value = this.ref;
        }
    }
    onUnmount() {
        if (this.subscriptions) {
            for (const subscription of this.subscriptions) {
                subscription.unsubscribe();
            }
            this.subscriptions = null;
        }
        if (this.props.ref instanceof ValImpl) {
            this.props.ref.value = null;
        }
    }
}
class _VNodeObservable {
    type;
    value;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    subscription = null;
    _renderedChildren = null;
    constructor(ref, value, parent) {
        this.type = 'observable';
        this.value = value;
        this.parent = parent;
        this.ref = ref;
        this.render(value.value);
        this.subscription = value.subscribe(this.render.bind(this));
    }
    render(jsxNode) {
        if ((typeof jsxNode === 'string' || typeof jsxNode === 'number')
            && this._renderedChildren?.length === 1
            && this._renderedChildren[0] instanceof Node
            && this._renderedChildren[0].nodeType === Node.TEXT_NODE) {
            // optimized update path for text nodes
            this._renderedChildren[0].textContent = jsxNode.toString();
        }
        else {
            this.firstChild = this.lastChild = null;
            this._renderedChildren = renderJSX(jsxNode, this);
            this.ref.update(this._renderedChildren);
        }
    }
    onUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}
class _VNodeFor {
    type;
    value;
    props;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    subscription = null;
    cache = new MultiEntryCache();
    mapFn;
    constructor(ref, props, parent) {
        this.type = 'builtin';
        this.value = For;
        this.props = props;
        this.parent = parent;
        this.ref = ref;
        const typedProps = props;
        if (typeof typedProps.children !== 'function') {
            throw new Error('The <For> component must have exactly one child — a function that maps each item.');
        }
        this.mapFn = typedProps.children;
        if (Array.isArray(typedProps.of)) {
            this.render(typedProps.of);
        }
        else if (typedProps.of instanceof ObservableImpl) {
            this.render(typedProps.of.value);
            this.subscription = typedProps.of.subscribe(this.render.bind(this));
        }
        else {
            throw new Error("The 'of' prop on <For> is required and must be an array or an observable array.");
        }
    }
    render(items) {
        this.firstChild = this.lastChild = null;
        const n = items.length;
        const renderedItems = [];
        for (let i = 0; i < n; i++) {
            const value = items[i];
            let item = this.cache.get(value);
            if (item) {
                item.index.value = i;
                this.firstChild ??= item.head;
                if (item.tail) {
                    if (this.lastChild) {
                        this.lastChild.next = item.head;
                    }
                    this.lastChild = item.tail;
                }
            }
            else {
                const index = val(i);
                let head = this.lastChild;
                renderJSX(this.mapFn({ item: value, index }), this);
                let tail = this.lastChild;
                if (head !== tail) {
                    head = head ? head.next : this.firstChild;
                }
                else {
                    head = tail = null;
                }
                item = { index, head, tail };
            }
            renderedItems.push([value, item]);
        }
        if (this.lastChild) {
            this.lastChild.next = null;
        }
        this.ref.update(this.firstChild ? resolveRenderedVNodes(this.firstChild) : null);
        this.cache.clear();
        this.cache.addRange(renderedItems);
    }
    onUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}
class _VNodeShow {
    type;
    value;
    props;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    subscription = null;
    constructor(ref, props, parent) {
        this.type = 'builtin';
        this.value = Show;
        this.props = props;
        this.parent = parent;
        this.ref = ref;
        const when = props.when;
        if (typeof when === 'boolean') {
            this.render(when);
        }
        else if (when instanceof ObservableImpl) {
            this.render(when.value);
            this.subscription = when.subscribe(this.render.bind(this));
        }
        else {
            throw new Error("The 'when' prop on <Show> is required and must be a boolean or an observable boolean.");
        }
    }
    render(value) {
        if (value) {
            const childrenOrFn = this.props.children;
            this.firstChild = this.lastChild = null;
            const children = renderJSX(typeof childrenOrFn === 'function'
                ? childrenOrFn()
                : childrenOrFn, this);
            this.ref.update(children);
        }
        else {
            this.firstChild = this.lastChild = null;
            this.ref.update(null);
        }
    }
    onUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}

export { Fragment, jsx, jsx as jsxDEV, jsx as jsxs, render };
