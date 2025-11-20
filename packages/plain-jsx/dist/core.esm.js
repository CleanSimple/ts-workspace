import { isObservable, val, subscribe } from '@cleansimple/observable';
import { For } from './components/For.esm.js';
import { Fragment } from './components/Fragment.esm.js';
import { Show } from './components/Show.esm.js';
import { With } from './components/With.esm.js';
import { WithMany } from './components/WithMany.esm.js';
import { setProps } from './dom.esm.js';
import { cleanupVNode, defineRef, setLifecycleContext } from './lifecycle.esm.js';
import { resolveReactiveNodes, ReactiveNode } from './reactive-node.esm.js';
import { RefImpl, RefValue } from './ref.esm.js';
import { nextTick } from './scheduling.esm.js';
import { splitNamespace } from './utils.esm.js';

const _lifecycleContext = {
    ref: null,
    subscriptions: null,
    onMountCallback: null,
    onCleanupCallback: null,
};
const _renderedRoots = [];
function render(root, jsxNode) {
    const vNode = new VNodeRoot();
    const children = renderJSX(jsxNode, vNode);
    _renderedRoots.push(vNode);
    root.append(...resolveReactiveNodes(children));
    return {
        dispose: () => {
            const index = _renderedRoots.indexOf(vNode);
            if (index === -1)
                return;
            cleanupVNode(vNode);
            for (const child of resolveReactiveNodes(children)) {
                root.removeChild(child);
            }
            _renderedRoots.splice(index, 1);
        },
    };
}
function renderJSX(jsxNode, parent, domNodes = []) {
    const nodes = [jsxNode];
    while (nodes.length > 0) {
        const node = nodes.shift();
        // skip null, undefined and boolean
        if (node == null || typeof node === 'boolean') {
            continue;
        }
        // render strings
        else if (typeof node === 'string' || typeof node === 'number') {
            const textNode = document.createTextNode(String(node));
            domNodes.push(textNode);
        }
        // render observables
        else if (isObservable(node)) {
            const reactiveNode = new ReactiveNode();
            const vNode = new VNodeObservable(reactiveNode, node);
            appendVNodeChild(parent, vNode);
            vNode.render();
            domNodes.push(reactiveNode);
        }
        // flatten arrays
        else if (Array.isArray(node)) {
            nodes.unshift(...node);
        }
        else if ('type' in node) {
            // flatten fragments
            if (node.type === Fragment) {
                if (Array.isArray(node.props.children)) {
                    nodes.unshift(...node.props.children);
                }
                else {
                    nodes.unshift(node.props.children);
                }
            }
            // render DOM elements
            else if (typeof node.type === 'string') {
                const hasNS = node.type.includes(':');
                const domElement = hasNS
                    ? document.createElementNS(...splitNamespace(node.type))
                    : document.createElement(node.type);
                const subscriptions = setProps(domElement, node.props);
                if (subscriptions) {
                    parent.registerSubscriptions(subscriptions);
                }
                const children = renderJSX(node.props.children, parent);
                domElement.append(...resolveReactiveNodes(children));
                domNodes.push(domElement);
            }
            // render components
            else {
                const VNodeConstructor = BuiltinComponentMap.get(node.type);
                // render built-in components
                if (VNodeConstructor) {
                    const reactiveNode = new ReactiveNode();
                    const vNode = new VNodeConstructor(reactiveNode, node.props);
                    appendVNodeChild(parent, vNode);
                    vNode.render();
                    domNodes.push(reactiveNode);
                }
                // render functional components
                else {
                    setLifecycleContext(_lifecycleContext);
                    const jsxNode = node.type(node.props, { defineRef });
                    setLifecycleContext(null);
                    const vNode = new VNodeFunctionalComponent(node.props, _lifecycleContext);
                    appendVNodeChild(parent, vNode);
                    // reset the lifecycle context
                    _lifecycleContext.ref = null;
                    _lifecycleContext.subscriptions = null;
                    _lifecycleContext.onMountCallback = null;
                    _lifecycleContext.onCleanupCallback = null;
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
    if (parent.lastChild) {
        parent.lastChild.next = vNode;
        parent.lastChild = vNode;
    }
    else {
        parent.firstChild = parent.lastChild = vNode;
    }
}
class VNodeBase {
    firstChild = null;
    lastChild = null;
    next = null;
}
class VNodeRoot extends VNodeBase {
    _subscriptions = null;
    registerSubscriptions(subscriptions) {
        this._subscriptions ??= [];
        this._subscriptions.push(...subscriptions);
    }
    cleanup() {
        if (this._subscriptions) {
            const n = this._subscriptions.length;
            for (let i = 0; i < n; ++i) {
                this._subscriptions[i].unsubscribe();
            }
            this._subscriptions = null;
        }
    }
}
class VNodeBuiltinComponent extends VNodeBase {
    reactiveNode;
    _subscription = null;
    constructor(reactiveNode) {
        super();
        this.reactiveNode = reactiveNode;
    }
    setSubscription(subscription) {
        this._subscription = subscription;
    }
    cleanup() {
        this._subscription?.unsubscribe();
    }
}
class VNodeFunctionalComponent extends VNodeRoot {
    _ref;
    _refProp = null;
    _onCleanupCallback;
    constructor(props, lifecycleContext) {
        super();
        this._ref = lifecycleContext.ref;
        this._onCleanupCallback = lifecycleContext.onCleanupCallback;
        if (lifecycleContext.subscriptions) {
            this.registerSubscriptions(lifecycleContext.subscriptions);
        }
        if (props.ref instanceof RefImpl) {
            this._refProp = props.ref;
            this._refProp[RefValue] = this._ref;
        }
        if (lifecycleContext.onMountCallback) {
            nextTick(lifecycleContext.onMountCallback);
        }
    }
    cleanup() {
        super.cleanup();
        this._onCleanupCallback?.();
        if (this._refProp) {
            this._refProp[RefValue] = null;
        }
    }
}
class VNodeObservable extends VNodeBuiltinComponent {
    _value;
    _textNode = null;
    constructor(reactiveNode, value) {
        super(reactiveNode);
        this._value = value;
        this.setSubscription(this._value.subscribe((value) => this.renderValue(value)));
    }
    render() {
        this.renderValue(this._value.value);
    }
    renderValue(jsxNode) {
        if ((typeof jsxNode === 'string' || typeof jsxNode === 'number')
            && this._textNode) {
            // optimized update path for text nodes
            this._textNode.textContent = String(jsxNode);
        }
        else {
            if (this.firstChild) {
                cleanupVNode(this.firstChild);
            }
            const vNode = new VNodeRoot();
            this.firstChild = this.lastChild = vNode;
            this._textNode = null;
            const children = renderJSX(jsxNode, vNode);
            if (children.length === 1 && children[0] instanceof Text) {
                this._textNode = children[0];
            }
            this.reactiveNode.update(children);
        }
    }
}
class VNodeFor extends VNodeBuiltinComponent {
    _of;
    _children;
    _frontBuffer = new Map();
    _backBuffer = new Map();
    constructor(reactiveNode, props) {
        super(reactiveNode);
        const forProps = props;
        this._children = forProps.children;
        this._of = forProps.of;
        if (isObservable(this._of)) {
            this.setSubscription(this._of.subscribe((value) => this.renderValue(value)));
        }
    }
    render() {
        this.renderValue(isObservable(this._of) ? this._of.value : this._of);
    }
    renderValue(items) {
        this.firstChild = this.lastChild = null;
        const children = [];
        const n = items.length;
        for (let i = 0; i < n; ++i) {
            const value = items[i];
            let item = this._frontBuffer.get(value);
            if (item) {
                this._frontBuffer.delete(value);
                item.index.value = i;
            }
            else {
                const index = val(i);
                const vNode = new VNodeRoot();
                const children = renderJSX(this._children({ item: value, index }), vNode);
                item = { index, vNode, children: children.length > 0 ? children : null };
            }
            appendVNodeChild(this, item.vNode);
            if (item.children) {
                children.push(...item.children);
            }
            this._backBuffer.set(value, item);
        }
        if (this.lastChild) {
            this.lastChild.next = null;
        }
        [this._frontBuffer, this._backBuffer] = [this._backBuffer, this._frontBuffer];
        for (const item of this._backBuffer.values()) {
            cleanupVNode(item.vNode);
        }
        this._backBuffer.clear();
        this.reactiveNode.update(children);
    }
}
class VNodeShow extends VNodeBuiltinComponent {
    _when;
    _is;
    _keyed;
    _children;
    _fallback;
    _shown = null;
    constructor(reactiveNode, props) {
        super(reactiveNode);
        const showProps = props;
        this._when = showProps.when;
        this._is = showProps.is;
        this._keyed = showProps.keyed ?? false;
        this._children = showProps.children;
        this._fallback = showProps.fallback ?? null;
        if (isObservable(this._when)) {
            this.setSubscription(this._when.subscribe((value) => this.renderValue(value)));
        }
    }
    render() {
        this.renderValue(isObservable(this._when) ? this._when.value : this._when);
    }
    renderValue(value) {
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
        if (this.firstChild) {
            cleanupVNode(this.firstChild);
        }
        this.firstChild = this.lastChild = null;
        const jsxNode = show ? this._children : this._fallback;
        if (jsxNode) {
            const vNode = new VNodeRoot();
            this.firstChild = this.lastChild = vNode;
            const children = renderJSX(typeof jsxNode === 'function' ? jsxNode(value) : jsxNode, vNode);
            this.reactiveNode.update(children);
        }
        else {
            this.reactiveNode.update(null);
        }
    }
}
class VNodeWith extends VNodeBuiltinComponent {
    _value;
    _children;
    constructor(reactiveNode, props) {
        super(reactiveNode);
        const withProps = props;
        this._value = withProps.value;
        this._children = withProps.children;
        if (isObservable(this._value)) {
            this.setSubscription(this._value.subscribe((value) => this.renderValue(value)));
        }
    }
    render() {
        this.renderValue(isObservable(this._value) ? this._value.value : this._value);
    }
    renderValue(value) {
        if (this.firstChild) {
            cleanupVNode(this.firstChild);
        }
        const vNode = new VNodeRoot();
        this.firstChild = this.lastChild = vNode;
        const children = renderJSX(this._children(value), vNode);
        this.reactiveNode.update(children);
    }
}
class VNodeWithMany extends VNodeBuiltinComponent {
    _values;
    _children;
    constructor(reactiveNode, props) {
        super(reactiveNode);
        const withManyProps = props;
        this._values = withManyProps.values;
        this._children = withManyProps.children;
        const observables = [];
        for (let i = 0; i < this._values.length; ++i) {
            const value = this._values[i];
            if (isObservable(value)) {
                observables.push(value);
            }
        }
        if (observables.length > 0) {
            this.setSubscription(subscribe(observables, () => {
                this.render();
            }));
        }
    }
    render() {
        this.renderValue(...this._values.map(value => isObservable(value) ? value.value : value));
    }
    renderValue(...values) {
        if (this.firstChild) {
            cleanupVNode(this.firstChild);
        }
        const vNode = new VNodeRoot();
        this.firstChild = this.lastChild = vNode;
        const children = renderJSX(this._children(...values), vNode);
        this.reactiveNode.update(children);
    }
}
const BuiltinComponentMap = new Map([
    [For, VNodeFor],
    [Show, VNodeShow],
    [With, VNodeWith],
    [WithMany, VNodeWithMany],
]);

export { render };
