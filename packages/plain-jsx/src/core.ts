import type { Action, Predicate } from '@cleansimple/utils-js';
import type { ForProps } from './components/For';
import type { ShowProps } from './components/Show';
import type { WithProps } from './components/With';
import type { WithManyProps } from './components/WithMany';
import type { LifecycleContext } from './lifecycle';
import type { IDependant, Observable, Subscription, Val, ValuesOf } from './reactive';
import type { IHasUpdates } from './scheduling';
import type {
    JSXNode,
    PropsType,
    RNode,
    VNode,
    VNodeBuiltinComponent,
    VNodeElement,
    VNodeFunctionalComponent,
    VNodeObservable,
    VNodeRoot,
    VNodeText,
} from './types';

import { For } from './components/For';
import { Fragment } from './components/Fragment';
import { Show } from './components/Show';
import { With } from './components/With';
import { WithMany } from './components/WithMany';
import { setProps } from './dom';
import { cleanupVNodes, defineRef, setLifecycleContext } from './lifecycle';
import { ObservableImpl, val } from './reactive';
import { ReactiveNode, resolveReactiveNodes } from './reactive-node';
import { RefImpl, RefValue } from './ref';
import { DeferredUpdatesScheduler, nextTick } from './scheduling';
import { splitNamespace } from './utils';

const _lifecycleContext: LifecycleContext = {
    ref: null,
    subscriptions: null,
    onMountCallback: null,
    onCleanupCallback: null,
};

export function render(root: Element | DocumentFragment, jsxNode: JSXNode): void {
    const rootVNode = new VNodeRootImpl();
    const children = resolveReactiveNodes(renderJSX(jsxNode, rootVNode));
    root.append(...children);
}

function renderJSX(jsxNode: JSXNode, parent: VNode | null, domNodes: RNode[] = []): RNode[] {
    const nodes: JSXNode[] = [jsxNode];
    while (nodes.length > 0) {
        const node = nodes.shift();

        // skip null, undefined and boolean
        if (node == null || typeof node === 'boolean') {
            continue;
        }
        // render strings
        else if (typeof node === 'string' || typeof node === 'number') {
            const textNode = document.createTextNode(String(node));
            if (parent?.type !== 'element') {
                const vNode = new VNodeTextImpl(textNode, parent);
                appendVNodeChild(parent, vNode);
            }
            domNodes.push(textNode);
        }
        // render observables
        else if (node instanceof ObservableImpl) {
            const reactiveNode = new ReactiveNode();
            const vNode = new VNodeObservableImpl(reactiveNode, node, parent);
            appendVNodeChild(parent, vNode);

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

                const subscriptions = setProps(domElement as HTMLElement, node.props);

                let vNode: VNodeElement;
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
            // render components
            else {
                const VNodeConstructor = BuiltinComponentMap.get(node.type);
                // render built-in components
                if (VNodeConstructor) {
                    const reactiveNode = new ReactiveNode();
                    const vNode = new VNodeConstructor(reactiveNode, node.props, parent);
                    appendVNodeChild(parent, vNode);

                    domNodes.push(reactiveNode);
                }
                // render functional components
                else {
                    setLifecycleContext(_lifecycleContext);
                    const jsxNode = node.type(node.props, { defineRef });
                    setLifecycleContext(null);

                    const vNode = new VNodeFunctionalComponentImpl(
                        node.props,
                        _lifecycleContext,
                        parent,
                    );
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

function appendVNodeChild(parent: VNode | null, vNode: VNode) {
    if (!parent) return;
    if (parent.lastChild) {
        parent.lastChild.next = vNode;
        parent.lastChild = vNode;
    }
    else {
        parent.firstChild = parent.lastChild = vNode;
    }
}

function resolveRenderedVNodes(vNodes: VNode, childNodes: RNode[] = []) {
    let vNode: VNode | null = vNodes;
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

interface RenderedItem {
    index: Val<number>;
    head: VNode | null;
    tail: VNode | null;
}

class VNodeRootImpl implements VNodeRoot {
    public readonly type = 'root';
    public readonly parent: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;
    public readonly next: VNode | null = null;
}

class VNodeTextImpl implements VNodeText {
    public readonly type: 'text';
    public readonly ref: Text;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    public constructor(ref: Text, parent: VNode | null) {
        this.type = 'text';
        this.parent = parent;
        this.ref = ref;
    }
}

class VNodeElementImpl implements VNodeElement {
    public readonly type: 'element';
    public readonly ref: Element;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private _subscriptions: Subscription[] | null = null;

    public constructor(ref: Element, parent: VNode | null) {
        this.type = 'element';
        this.parent = parent;
        this.ref = ref;
    }

    public addSubscriptions(subscriptions: Subscription[]): void {
        this._subscriptions ??= [];
        this._subscriptions.push(...subscriptions);
    }

    public cleanup(): void {
        if (this._subscriptions) {
            for (const subscription of this._subscriptions) {
                subscription.unsubscribe();
            }
            this._subscriptions = null;
        }
    }
}

class VNodeFunctionalComponentImpl implements VNodeFunctionalComponent {
    public readonly type: 'component';
    public readonly ref: object | null;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private readonly _refProp: RefImpl<object> | null = null;
    private readonly _onCleanupCallback: Action | null;
    private readonly _subscriptions: Subscription[] | null;

    public constructor(
        props: PropsType,
        lifecycleContext: LifecycleContext,
        parent: VNode | null,
    ) {
        this.type = 'component';
        this.parent = parent;
        this.ref = lifecycleContext.ref;
        this._onCleanupCallback = lifecycleContext.onCleanupCallback;
        this._subscriptions = lifecycleContext.subscriptions;

        if (props.ref instanceof RefImpl) {
            this._refProp = props.ref;
            this._refProp[RefValue] = this.ref;
        }
        if (lifecycleContext.onMountCallback) {
            nextTick(lifecycleContext.onMountCallback);
        }
    }

    public cleanup() {
        if (this._subscriptions) {
            const n = this._subscriptions.length;
            for (let i = 0; i < n; ++i) {
                this._subscriptions[i].unsubscribe();
            }
        }

        this._onCleanupCallback?.();

        if (this._refProp) {
            this._refProp[RefValue] = null;
        }
    }
}

class VNodeObservableImpl implements VNodeObservable {
    public readonly type: 'observable';
    public readonly ref: ReactiveNode;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private readonly _subscription: Subscription | null = null;
    private _textNode: Text | null = null;

    public constructor(ref: ReactiveNode, value: Observable<JSXNode>, parent: VNode | null) {
        this.type = 'observable';
        this.parent = parent;
        this.ref = ref;

        this.render(value.value);
        this._subscription = value.subscribe((value) => this.render(value));
    }

    private render(jsxNode: JSXNode): void {
        if (
            (typeof jsxNode === 'string' || typeof jsxNode === 'number')
            && this._textNode
        ) {
            // optimized update path for text nodes
            this._textNode.textContent = String(jsxNode);
        }
        else {
            if (this.firstChild) {
                cleanupVNodes(this.firstChild);
            }
            this.firstChild = this.lastChild = null;
            this._textNode = null;
            const children = renderJSX(jsxNode, this);
            if (children.length === 1 && children[0] instanceof Text) {
                this._textNode = children[0];
            }
            this.ref.update(children);
        }
    }

    public cleanup(): void {
        this._subscription?.unsubscribe();
    }
}

class VNodeFor<T> implements VNodeBuiltinComponent {
    public readonly type: 'builtin';
    public readonly ref: ReactiveNode;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private readonly _children: ForProps<T>['children'];
    private readonly _subscription: Subscription | null = null;
    private _frontBuffer = new Map<unknown, RenderedItem>();
    private _backBuffer = new Map<unknown, RenderedItem>();

    public constructor(ref: ReactiveNode, props: PropsType, parent: VNode | null) {
        this.type = 'builtin';
        this.parent = parent;
        this.ref = ref;

        const forProps = props as unknown as ForProps<T>;
        this._children = forProps.children;
        const of = forProps.of as T[] | ObservableImpl<T[]>;

        if (Array.isArray(of)) {
            this.render(of);
        }
        else if (of instanceof ObservableImpl) {
            this.render(of.value);
            this._subscription = of.subscribe((value) => this.render(value));
        }
        else {
            throw new Error(
                "The 'of' prop on <For> is required and must be an array or an observable array.",
            );
        }
    }

    private render(items: T[]): void {
        this.firstChild = this.lastChild = null as VNode | null;
        const newItems: RenderedItem[] = [];
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

        for (const item of this._frontBuffer.values()) {
            if (item.head) {
                cleanupVNodes(item.head, item.tail);
            }
        }

        this.ref.update(this.firstChild ? resolveRenderedVNodes(this.firstChild) : null);

        [this._frontBuffer, this._backBuffer] = [this._backBuffer, this._frontBuffer];
        this._backBuffer.clear();
    }

    public cleanup() {
        this._subscription?.unsubscribe();
    }
}

class VNodeShow<T> implements VNodeBuiltinComponent {
    public readonly type: 'builtin';
    public readonly ref: ReactiveNode;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private readonly _is: ShowProps<T>['is'];
    private readonly _keyed: ShowProps<T>['keyed'];
    private readonly _children: ShowProps<T>['children'];
    private readonly _fallback: ShowProps<T>['fallback'] | null;
    private readonly _subscription: Subscription | null = null;
    private _shown: boolean | null = null;

    public constructor(ref: ReactiveNode, props: PropsType, parent: VNode | null) {
        this.type = 'builtin';
        this.parent = parent;
        this.ref = ref;

        const showProps = props as unknown as ShowProps<T>;
        const when = showProps.when as T | ObservableImpl<T>;
        this._is = showProps.is;
        this._keyed = showProps.keyed ?? false;
        this._children = showProps.children;
        this._fallback = showProps.fallback ?? null;

        if (when instanceof ObservableImpl) {
            this.render(when.value);
            this._subscription = when.subscribe((value) => this.render(value));
        }
        else {
            this.render(when);
        }
    }

    private render(value: T) {
        let show: boolean;
        if (this._is === undefined) {
            show = Boolean(value);
        }
        else if (typeof this._is === 'function') {
            show = (this._is as Predicate<T>)(value);
        }
        else {
            show = value === this._is;
        }

        if (!this._keyed && this._shown === show) {
            return;
        }
        this._shown = show;

        if (this.firstChild) {
            cleanupVNodes(this.firstChild);
        }
        this.firstChild = this.lastChild = null;
        const jsxNode = show ? this._children : this._fallback;
        if (jsxNode) {
            const children = renderJSX(
                typeof jsxNode === 'function' ? jsxNode(value) : jsxNode,
                this,
            );
            this.ref.update(children);
        }
        else {
            this.ref.update(null);
        }
    }

    public cleanup() {
        this._subscription?.unsubscribe();
    }
}

class VNodeWith<T> implements VNodeBuiltinComponent {
    public readonly type: 'builtin';
    public readonly ref: ReactiveNode;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private readonly _children: WithProps<T>['children'];
    private readonly _subscription: Subscription | null = null;

    public constructor(ref: ReactiveNode, props: PropsType, parent: VNode | null) {
        this.type = 'builtin';
        this.parent = parent;
        this.ref = ref;

        const withProps = props as unknown as WithProps<T>;
        const value = withProps.value as T | ObservableImpl<T>;
        this._children = withProps.children;

        if (value instanceof ObservableImpl) {
            this.render(value.value);
            this._subscription = value.subscribe((value) => this.render(value));
        }
        else {
            this.render(value);
        }
    }

    private render(value: T) {
        if (this.firstChild) {
            cleanupVNodes(this.firstChild);
        }
        this.firstChild = this.lastChild = null;
        const children = renderJSX(this._children(value), this);
        this.ref.update(children);
    }

    public cleanup() {
        this._subscription?.unsubscribe();
    }
}

class VNodeWithMany<T extends readonly unknown[]>
    implements VNodeBuiltinComponent, IHasUpdates, IDependant
{
    public readonly type: 'builtin';
    public readonly ref: ReactiveNode;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private readonly _values: WithManyProps<T>['values'];
    private readonly _children: WithManyProps<T>['children'];
    private readonly _subscriptions: Subscription[] | null = null;
    private _pendingUpdates: boolean = false;

    public constructor(ref: ReactiveNode, props: PropsType, parent: VNode | null) {
        this.type = 'builtin';
        this.parent = parent;
        this.ref = ref;

        const withManyProps = props as unknown as WithManyProps<T>;
        this._values = withManyProps.values;
        this._children = withManyProps.children;

        const args: unknown[] = [];
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
        this.render(...args);
    }

    public onDependencyUpdated() {
        if (this._pendingUpdates) return;
        this._pendingUpdates = true;
        DeferredUpdatesScheduler.schedule(this);
    }

    public flushUpdates() {
        if (!this._pendingUpdates) return;
        this._pendingUpdates = false;
        const values = this._values.map(value =>
            value instanceof ObservableImpl ? value.value as unknown : value
        );
        this.render(...values);
    }

    private render(...values: unknown[]) {
        if (this.firstChild) {
            cleanupVNodes(this.firstChild);
        }
        this.firstChild = this.lastChild = null;
        const children = renderJSX(this._children(...values as ValuesOf<T>), this);
        this.ref.update(children);
    }

    public cleanup() {
        if (this._subscriptions) {
            for (let i = 0; i < this._subscriptions.length; ++i) {
                this._subscriptions[i].unsubscribe();
            }
        }
    }
}

type BuiltinVNodeConstructor = new(
    ref: ReactiveNode,
    props: PropsType,
    parent: VNode | null,
) => VNodeBuiltinComponent;

const BuiltinComponentMap = new Map<unknown, BuiltinVNodeConstructor>(
    [
        [For, VNodeFor],
        [Show, VNodeShow],
        [With, VNodeWith],
        [WithMany, VNodeWithMany],
    ],
);
