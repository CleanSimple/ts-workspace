import { For } from './components/For.esm.js';
import { Fragment } from './components/Fragment.esm.js';
import { Show } from './components/Show.esm.js';
import { With } from './components/With.esm.js';
import { WithMany } from './components/WithMany.esm.js';
import { setProps } from './dom.esm.js';
import { mountVNodes, defineRef, unmountVNodes, setCurrentFunctionalComponent } from './lifecycle.esm.js';
import { ObservableImpl, ValImpl, val } from './observable.esm.js';
import { resolveReactiveNodes, ReactiveNode } from './reactive-node.esm.js';
import { DeferredUpdatesScheduler } from './scheduling.esm.js';
import { splitNamespace } from './utils.esm.js';

function render(root, jsxNode) {
    const rootVNode = new VNodeRootImpl();
    const children = resolveReactiveNodes(renderJSX(jsxNode, rootVNode));
    root.append(...children);
    if (rootVNode.firstChild) {
        mountVNodes(rootVNode.firstChild);
    }
}
function renderJSX(jsxNode, parent, domNodes = []) {
    const nodes = [jsxNode];
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
                const vNode = new VNodeTextImpl(textNode, parent);
                appendVNodeChild(parent, vNode);
            }
            domNodes.push(textNode);
        }
        else if (node instanceof ObservableImpl) {
            const reactiveNode = new ReactiveNode();
            const vNode = new VNodeObservableImpl(reactiveNode, node, parent);
            appendVNodeChild(parent, vNode);
            domNodes.push(reactiveNode);
        }
        else if ('type' in node) {
            if (typeof node.type === 'string') {
                const hasNS = node.type.includes(':');
                const domElement = hasNS
                    ? document.createElementNS(...splitNamespace(node.type))
                    : document.createElement(node.type);
                const subscriptions = setProps(domElement, node.props);
                let vNode;
                if (parent?.type === 'element') {
                    // as a memory optimization we don't create vNodes for descendants of an element that are also elements
                    // we have no use for them anyway
                    vNode = parent;
                }
                else {
                    vNode = new VNodeElementImpl(domElement, parent);
                    appendVNodeChild(parent, vNode);
                }
                if (subscriptions) {
                    vNode.addSubscriptions(subscriptions);
                }
                const children = renderJSX(node.props.children, vNode);
                domElement.append(...resolveReactiveNodes(children));
                domNodes.push(domElement);
            }
            else {
                const VNodeConstructor = BuiltinComponentMap.get(node.type);
                if (VNodeConstructor) {
                    const reactiveNode = new ReactiveNode();
                    const vNode = new VNodeConstructor(reactiveNode, node.props, parent);
                    appendVNodeChild(parent, vNode);
                    domNodes.push(reactiveNode);
                }
                else {
                    const vNode = new VNodeFunctionalComponentImpl(node.props, parent);
                    setCurrentFunctionalComponent(vNode);
                    const jsxNode = node.type(node.props, { defineRef });
                    setCurrentFunctionalComponent(null);
                    appendVNodeChild(parent, vNode);
                    renderJSX(jsxNode, vNode, domNodes);
                }
            }
        }
        else {
            throw new Error('Invalid JSX node');
        }
    }
    return domNodes;
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
class VNodeRootImpl {
    type = 'root';
    parent = null;
    firstChild = null;
    lastChild = null;
    next = null;
}
class VNodeTextImpl {
    type;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    constructor(ref, parent) {
        this.type = 'text';
        this.parent = parent;
        this.ref = ref;
    }
}
class VNodeElementImpl {
    type;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    _subscriptions = null;
    constructor(ref, parent) {
        this.type = 'element';
        this.parent = parent;
        this.ref = ref;
    }
    addSubscriptions(subscriptions) {
        this._subscriptions ??= [];
        this._subscriptions.push(...subscriptions);
    }
    unmount() {
        if (this._subscriptions) {
            for (const subscription of this._subscriptions) {
                subscription.unsubscribe();
            }
            this._subscriptions = null;
        }
    }
}
class VNodeFunctionalComponentImpl {
    type;
    ref = null;
    onMountCallback = null;
    onUnmountCallback = null;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    _refProp = null;
    _subscriptions = null;
    constructor(props, parent) {
        this.type = 'component';
        this.parent = parent;
        if (props.ref instanceof ValImpl) {
            this._refProp = props.ref;
        }
    }
    addSubscription(subscription) {
        this._subscriptions ??= [];
        this._subscriptions.push(subscription);
    }
    mount() {
        if (this._refProp) {
            this._refProp.value = this.ref;
        }
        this.onMountCallback?.();
    }
    unmount() {
        if (this._subscriptions) {
            const n = this._subscriptions.length;
            for (let i = 0; i < n; ++i) {
                this._subscriptions[i].unsubscribe();
            }
            this._subscriptions = null;
        }
        this.onUnmountCallback?.();
        if (this._refProp) {
            this._refProp.value = null;
        }
    }
}
class VNodeObservableImpl {
    type;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    _subscription = null;
    _textNode = null;
    constructor(ref, value, parent) {
        this.type = 'observable';
        this.parent = parent;
        this.ref = ref;
        this.render(value.value, true);
        this._subscription = value.subscribe((value) => this.render(value));
    }
    render(jsxNode, initialRender = false) {
        if ((typeof jsxNode === 'string' || typeof jsxNode === 'number')
            && this._textNode) {
            // optimized update path for text nodes
            this._textNode.textContent = String(jsxNode);
        }
        else {
            if (!initialRender && this.firstChild) {
                unmountVNodes(this.firstChild);
            }
            this.firstChild = this.lastChild = null;
            this._textNode = null;
            const children = renderJSX(jsxNode, this);
            if (children.length === 1 && children[0] instanceof Text) {
                this._textNode = children[0];
            }
            this.ref.update(children);
            if (!initialRender && this.firstChild) {
                mountVNodes(this.firstChild);
            }
        }
    }
    unmount() {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
    }
}
class VNodeFor {
    type;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    _children;
    _subscription = null;
    _frontBuffer = new Map();
    _backBuffer = new Map();
    constructor(ref, props, parent) {
        this.type = 'builtin';
        this.parent = parent;
        this.ref = ref;
        const forProps = props;
        this._children = forProps.children;
        const of = forProps.of;
        if (Array.isArray(of)) {
            this.render(of, true);
        }
        else if (of instanceof ObservableImpl) {
            this.render(of.value, true);
            this._subscription = of.subscribe((value) => this.render(value));
        }
        else {
            throw new Error("The 'of' prop on <For> is required and must be an array or an observable array.");
        }
    }
    render(items, initialRender = false) {
        this.firstChild = this.lastChild = null;
        const newItems = [];
        const n = items.length;
        for (let i = 0; i < n; ++i) {
            const value = items[i];
            let item = this._frontBuffer.get(value);
            if (item) {
                this._frontBuffer.delete(value);
                item.index.value = i;
                if (item.head) {
                    if (this.lastChild) {
                        this.lastChild.next = item.head;
                        this.lastChild = item.tail;
                    }
                    else {
                        this.firstChild = item.head;
                        this.lastChild = item.tail;
                    }
                }
            }
            else {
                const index = val(i);
                let head = this.lastChild;
                renderJSX(this._children({ item: value, index }), this);
                let tail = this.lastChild;
                if (head !== tail) {
                    head = head ? head.next : this.firstChild;
                }
                else {
                    head = tail = null;
                }
                item = { index, head, tail };
                newItems.push(item);
            }
            this._backBuffer.set(value, item);
        }
        if (this.lastChild) {
            this.lastChild.next = null;
        }
        if (!initialRender) {
            for (const item of this._frontBuffer.values()) {
                if (item.head) {
                    unmountVNodes(item.head, item.tail);
                }
            }
        }
        this.ref.update(this.firstChild ? resolveRenderedVNodes(this.firstChild) : null);
        if (!initialRender) {
            const nNewItems = newItems.length;
            for (let i = 0; i < nNewItems; ++i) {
                const item = newItems[i];
                if (item.head) {
                    mountVNodes(item.head, item.tail);
                }
            }
        }
        [this._frontBuffer, this._backBuffer] = [this._backBuffer, this._frontBuffer];
        this._backBuffer.clear();
    }
    unmount() {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
    }
}
class VNodeShow {
    type;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    _is;
    _keyed;
    _children;
    _fallback;
    _subscription = null;
    _shown = null;
    constructor(ref, props, parent) {
        this.type = 'builtin';
        this.parent = parent;
        this.ref = ref;
        const showProps = props;
        const when = showProps.when;
        this._is = showProps.is;
        this._keyed = showProps.keyed ?? false;
        this._children = showProps.children;
        this._fallback = showProps.fallback ?? null;
        if (when instanceof ObservableImpl) {
            this.render(when.value, true);
            this._subscription = when.subscribe((value) => this.render(value));
        }
        else {
            this.render(when);
        }
    }
    render(value, initialRender = false) {
        let show;
        if (this._is === undefined) {
            show = Boolean(value);
        }
        else if (typeof this._is === 'function') {
            show = this._is(value);
        }
        else {
            show = value === this._is;
        }
        if (!this._keyed && this._shown === show) {
            return;
        }
        this._shown = show;
        if (!initialRender && this.firstChild) {
            unmountVNodes(this.firstChild);
        }
        this.firstChild = this.lastChild = null;
        const jsxNode = show ? this._children : this._fallback;
        if (jsxNode) {
            const children = renderJSX(typeof jsxNode === 'function' ? jsxNode(value) : jsxNode, this);
            this.ref.update(children);
            if (!initialRender && this.firstChild) {
                mountVNodes(this.firstChild);
            }
        }
        else {
            this.ref.update(null);
        }
    }
    unmount() {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
    }
}
class VNodeWith {
    type;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    _children;
    _subscription = null;
    constructor(ref, props, parent) {
        this.type = 'builtin';
        this.parent = parent;
        this.ref = ref;
        const withProps = props;
        const value = withProps.value;
        this._children = withProps.children;
        if (value instanceof ObservableImpl) {
            this.render(value.value, true);
            this._subscription = value.subscribe((value) => this.render(value));
        }
        else {
            this.render(value);
        }
    }
    render(value, initialRender = false) {
        if (!initialRender && this.firstChild) {
            unmountVNodes(this.firstChild);
        }
        this.firstChild = this.lastChild = null;
        const children = renderJSX(this._children(value), this);
        this.ref.update(children);
        if (!initialRender && this.firstChild) {
            mountVNodes(this.firstChild);
        }
    }
    unmount() {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
    }
}
class VNodeWithMany {
    type;
    ref;
    parent;
    next = null;
    firstChild = null;
    lastChild = null;
    _values;
    _children;
    _subscriptions = null;
    _pendingUpdates = false;
    constructor(ref, props, parent) {
        this.type = 'builtin';
        this.parent = parent;
        this.ref = ref;
        const withManyProps = props;
        this._values = withManyProps.values;
        this._children = withManyProps.children;
        const args = [];
        for (let i = 0; i < this._values.length; ++i) {
            const value = this._values[i];
            if (value instanceof ObservableImpl) {
                args.push(value.value);
                this._subscriptions ??= [];
                this._subscriptions.push(value.registerDependant(this));
            }
            else {
                args.push(value);
            }
        }
        this.render(true, ...args);
    }
    onDependencyUpdated() {
        if (this._pendingUpdates)
            return;
        this._pendingUpdates = true;
        DeferredUpdatesScheduler.schedule(this);
    }
    flushUpdates() {
        if (!this._pendingUpdates)
            return;
        this._pendingUpdates = false;
        const values = this._values.map(value => value instanceof ObservableImpl ? value.value : value);
        this.render(false, ...values);
    }
    render(initialRender, ...values) {
        if (!initialRender && this.firstChild) {
            unmountVNodes(this.firstChild);
        }
        this.firstChild = this.lastChild = null;
        const children = renderJSX(this._children(...values), this);
        this.ref.update(children);
        if (!initialRender && this.firstChild) {
            mountVNodes(this.firstChild);
        }
    }
    unmount() {
        if (this._subscriptions) {
            for (let i = 0; i < this._subscriptions.length; ++i) {
                this._subscriptions[i].unsubscribe();
            }
            this._subscriptions = null;
        }
    }
}
const BuiltinComponentMap = new Map([
    [For, VNodeFor],
    [Show, VNodeShow],
    [With, VNodeWith],
    [WithMany, VNodeWithMany],
]);

export { render };
