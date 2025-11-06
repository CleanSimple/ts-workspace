import type { Predicate } from '@cleansimple/utils-js';
import type { ForProps } from './components/For';
import type { ShowProps } from './components/Show';
import type { WithProps } from './components/With';
import type { WithManyProps } from './components/WithMany';
import type { IDependant, Observable, Subscription, Val, ValuesOf } from './observable';
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
    VNodeText,
} from './types';

import { For } from './components/For';
import { Fragment } from './components/Fragment';
import { Show } from './components/Show';
import { With } from './components/With';
import { WithMany } from './components/WithMany';
import { patchNode, setProps } from './dom';
import { defineRef, mountNodes, setCurrentFunctionalComponent } from './lifecycle';
import { ObservableImpl, val, ValImpl } from './observable';
import { ReactiveNode, resolveReactiveNodes } from './reactive-node';
import { DeferredUpdatesScheduler } from './scheduling';
import { findParentComponent, splitNamespace } from './utils';

export function render(root: Element | DocumentFragment, jsxNode: JSXNode): void {
    const children = resolveReactiveNodes(renderJSX(jsxNode, null));
    root.append(...children);
    mountNodes(children);
}

function renderJSX(jsxNode: JSXNode, parent: VNode | null, domNodes: RNode[] = []): RNode[] {
    const nodes: JSXNode[] = [jsxNode];
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
                patchNode(textNode, vNode);
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

                const subscriptions = setProps(domElement as HTMLElement, node.props);

                if (parent?.type === 'element') {
                    // VNodes are only used to track children of components and reactive nodes
                    // if the parent is an element, we can append the dom element directly and add the subscriptions
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
                    const vNode = new VNodeElementImpl(domElement, parent);
                    vNode.subscriptions = subscriptions;
                    patchNode(domElement, vNode);
                    appendVNodeChild(parent, vNode);

                    const children = renderJSX(node.props.children, vNode);
                    domElement.append(...resolveReactiveNodes(children));
                }

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
    public subscriptions: Subscription[] | null = null;

    public constructor(ref: Element, parent: VNode | null) {
        this.type = 'element';
        this.parent = parent;
        this.ref = ref;
    }

    public unmount(): void {
        if (this.subscriptions) {
            for (const subscription of this.subscriptions) {
                subscription.unsubscribe();
            }
            this.subscriptions = null;
        }
    }
}

class VNodeFunctionalComponentImpl implements VNodeFunctionalComponent, IHasUpdates {
    public readonly type: 'component';
    public ref: object | null = null;
    public onMountCallback: VNodeFunctionalComponent['onMountCallback'] = null;
    public onUnmountCallback: VNodeFunctionalComponent['onUnmountCallback'] = null;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private readonly _refVal: Val<object | null> | null = null;
    private _isMounted: boolean = false;
    private _mountedChildrenCount: number = 0;
    private _subscriptions: Subscription[] | null = null;
    private _pendingUpdates: boolean = false;

    public constructor(props: PropsType, parent: VNode | null) {
        this.type = 'component';
        this.parent = parent;

        if (props.ref instanceof ValImpl) {
            this._refVal = props.ref;
        }
    }

    public mount(): void {
        this._mountedChildrenCount++;
        if (!this._pendingUpdates) {
            this._pendingUpdates = true;
            DeferredUpdatesScheduler.schedule(this);
        }
    }

    public unmount(force: boolean): void {
        if (force) {
            if (this._isMounted) {
                this.unmountInternal();
            }
            this._mountedChildrenCount = 0;
            return;
        }
        this._mountedChildrenCount--;
        if (!this._pendingUpdates) {
            this._pendingUpdates = true;
            DeferredUpdatesScheduler.schedule(this);
        }
    }

    public flushUpdates() {
        this._pendingUpdates = false;

        if (this._mountedChildrenCount > 0 && !this._isMounted) {
            this.mountInternal();
            findParentComponent(this)?.mount();
        }
        else if (this._mountedChildrenCount === 0 && this._isMounted) {
            this.unmountInternal();
            findParentComponent(this)?.unmount(false);
        }
    }

    private mountInternal(): void {
        if (this._refVal) {
            this._refVal.value = this.ref;
        }

        if (this.onMountCallback) {
            const result = this.onMountCallback();
            this._subscriptions = result ?? null;
        }

        this._isMounted = true;
    }

    private unmountInternal(): void {
        if (this._subscriptions) {
            const n = this._subscriptions.length;
            for (let i = 0; i < n; ++i) {
                this._subscriptions[i].unsubscribe();
            }
            this._subscriptions = null;
        }

        this.onUnmountCallback?.();

        if (this._refVal) {
            this._refVal.value = null;
        }

        this._isMounted = false;
    }
}

class VNodeObservableImpl implements VNodeObservable {
    public readonly type: 'observable';
    public readonly ref: ReactiveNode;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private _subscription: Subscription | null = null;
    private _renderedChildren: RNode[] | null = null;

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
            && this._renderedChildren?.length === 1
            && this._renderedChildren[0] instanceof Text
        ) {
            // optimized update path for text nodes
            this._renderedChildren[0].textContent = jsxNode.toString();
        }
        else {
            this.firstChild = this.lastChild = null;
            this._renderedChildren = renderJSX(jsxNode, this);
            this.ref.update(this._renderedChildren);
        }
    }

    public unmount(): void {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
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
    private _subscription: Subscription | null = null;
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

    private render(items: T[]) {
        this.firstChild = this.lastChild = null;
        const n = items.length;
        for (let i = 0; i < n; ++i) {
            const value = items[i];
            let item = this._frontBuffer.get(value);
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
                renderJSX(this._children({ item: value, index }), this);
                let tail = this.lastChild;

                if (head !== tail) {
                    head = head ? head.next : this.firstChild;
                }
                else {
                    head = tail = null;
                }
                item = { index, head, tail };
            }

            this._backBuffer.set(value, item);
        }
        if (this.lastChild) {
            this.lastChild.next = null;
        }

        this.ref.update(this.firstChild ? resolveRenderedVNodes(this.firstChild) : null);

        [this._frontBuffer, this._backBuffer] = [this._backBuffer, this._frontBuffer];
        this._backBuffer.clear();
    }

    public unmount() {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
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
    private _subscription: Subscription | null = null;
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

        this.firstChild = this.lastChild = null;
        const jsxNode = show ? this._children : this._fallback;
        if (jsxNode) {
            const children = renderJSX(
                typeof jsxNode === 'function' ? jsxNode() : jsxNode,
                this,
            );
            this.ref.update(children);
        }
        else {
            this.ref.update(null);
        }
    }

    public unmount() {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
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
    private _subscription: Subscription | null = null;

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
        this.firstChild = this.lastChild = null;
        const children = renderJSX(
            typeof this._children === 'function'
                ? this._children(value)
                : this._children,
            this,
        );
        this.ref.update(children);
    }

    public unmount() {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
        }
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
    private _subscriptions: Subscription[] | null = null;
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
        this.render(
            ...this._values.map(value =>
                value instanceof ObservableImpl ? value.value as unknown : value
            ),
        );
    }

    private render(...values: unknown[]) {
        this.firstChild = this.lastChild = null;
        const children = renderJSX(this._children(...values as ValuesOf<T>), this);
        this.ref.update(children);
    }

    public unmount() {
        if (this._subscriptions) {
            for (let i = 0; i < this._subscriptions.length; ++i) {
                this._subscriptions[i].unsubscribe();
            }
            this._subscriptions = null;
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
