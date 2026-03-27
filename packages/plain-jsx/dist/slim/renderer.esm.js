import '@cleansimple/plain-signals';
import { Fragment } from './components/Fragment.esm.js';
import { setProps } from './dom.esm.js';
import { cleanupVNode, defineRef, setLifecycleContext } from './lifecycle.esm.js';
import { RefImpl, RefValue } from './ref.esm.js';
import { nextTick } from './scheduler.esm.js';
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
    root.append(...children);
    return {
        dispose: () => {
            const index = _renderedRoots.indexOf(vNode);
            if (index === -1)
                return;
            cleanupVNode(vNode);
            for (const child of children) {
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
        else if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') {
            const textNode = document.createTextNode(String(node));
            domNodes.push(textNode);
        }
        // render signals
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
                domElement.append(...children);
                domNodes.push(domElement);
            }
            // render components
            else {
                {
                    // render functional components
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

export { render };
