import type { Signal, Subscription, Val } from '@cleansimple/plain-signals';
import type { ForProps } from './components/For';
import type { ShowProps } from './components/Show';
import type { WithProps } from './components/With';
import type { ValuesOf, WithManyProps } from './components/WithMany';
import type { LifecycleContext } from './lifecycle';
import type { Action, JSXNode, Predicate, PropsType, RNode, VNode } from './types';

import { isSignal, subscribe, val } from '@cleansimple/plain-signals';
import { For } from './components/For';
import { Fragment } from './components/Fragment';
import { Show } from './components/Show';
import { With } from './components/With';
import { WithMany } from './components/WithMany';
import { setProps } from './dom';
import { cleanupVNode, defineRef, setLifecycleContext } from './lifecycle';
import { ReactiveNode, resolveReactiveNodes } from './reactive-node';
import { RefImpl, RefValue } from './ref';
import { nextTick } from './scheduler';
import { splitNamespace } from './utils';

const _lifecycleContext: LifecycleContext = {
    ref: null,
    subscriptions: null,
    onMountCallback: null,
    onCleanupCallback: null,
};

const _renderedRoots: VNodeRoot[] = [];

export function render(root: Element, jsxNode: JSXNode): { dispose: Action } {
    const vNode = new VNodeRoot();
    const children = renderJSX(jsxNode, vNode);
    _renderedRoots.push(vNode);
    root.append(...resolveReactiveNodes(children));
    return {
        dispose: () => {
            const index = _renderedRoots.indexOf(vNode);
            if (index === -1) return;
            cleanupVNode(vNode);
            for (const child of resolveReactiveNodes(children)) {
                root.removeChild(child);
            }
            _renderedRoots.splice(index, 1);
        },
    };
}

function renderJSX(jsxNode: JSXNode, parent: VNodeRoot, domNodes: RNode[] = []): RNode[] {
    const nodes: JSXNode[] = [jsxNode];
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
        else if (isSignal(node)) {
            const reactiveNode = new ReactiveNode();
            const vNode = new VNodeSignal(reactiveNode, node);
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

                const subscriptions = setProps(domElement as HTMLElement, node.props);
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

                    const vNode = new VNodeFunctionalComponent(
                        node.props,
                        _lifecycleContext,
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

function appendVNodeChild(parent: VNode, vNode: VNode) {
    if (parent.lastChild) {
        parent.lastChild.next = vNode;
        parent.lastChild = vNode;
    }
    else {
        parent.firstChild = parent.lastChild = vNode;
    }
}

interface RenderedItem {
    index: Val<number>;
    vNode: VNode;
    children: RNode[] | null;
}

abstract class VNodeBase implements VNode {
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;
    public next: VNode | null = null;

    public abstract cleanup(): void;
}

class VNodeRoot extends VNodeBase {
    private _subscriptions: Subscription[] | null = null;

    public registerSubscriptions(subscriptions: Subscription[]) {
        this._subscriptions ??= [];
        this._subscriptions.push(...subscriptions);
    }

    public cleanup() {
        if (this._subscriptions) {
            const n = this._subscriptions.length;
            for (let i = 0; i < n; ++i) {
                this._subscriptions[i].unsubscribe();
            }
            this._subscriptions = null;
        }
    }
}

abstract class VNodeBuiltinComponent extends VNodeBase {
    protected readonly reactiveNode: ReactiveNode;
    private _subscription: Subscription | null = null;

    public constructor(reactiveNode: ReactiveNode) {
        super();
        this.reactiveNode = reactiveNode;
    }

    public setSubscription(subscription: Subscription) {
        this._subscription = subscription;
    }

    public abstract render(): void;

    public cleanup() {
        this._subscription?.unsubscribe();
    }
}

class VNodeFunctionalComponent extends VNodeRoot {
    private readonly _ref: object | null;
    private readonly _refProp: RefImpl<object> | null = null;
    private readonly _onCleanupCallback: Action | null;

    public constructor(props: PropsType, lifecycleContext: LifecycleContext) {
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

    public override cleanup(): void {
        super.cleanup();

        this._onCleanupCallback?.();
        if (this._refProp) {
            this._refProp[RefValue] = null;
        }
    }
}

class VNodeSignal extends VNodeBuiltinComponent {
    private readonly _value: Signal<JSXNode>;
    private _textNode: Text | null = null;

    public constructor(reactiveNode: ReactiveNode, value: Signal<JSXNode>) {
        super(reactiveNode);

        this._value = value;
        this.setSubscription(this._value.subscribe((value) => this.renderValue(value)));
    }

    public render(): void {
        this.renderValue(this._value.value);
    }

    private renderValue(value: JSXNode): void {
        if (
            (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint')
            && this._textNode
        ) {
            // optimized update path for text nodes
            this._textNode.textContent = String(value);
        }
        else {
            if (this.firstChild) {
                cleanupVNode(this.firstChild);
            }
            const vNode = new VNodeRoot();
            this.firstChild = this.lastChild = vNode;
            this._textNode = null;
            const children = renderJSX(value, vNode);
            if (children.length === 1 && children[0] instanceof Text) {
                this._textNode = children[0];
            }
            this.reactiveNode.update(children);
        }
    }
}

class VNodeFor<T> extends VNodeBuiltinComponent {
    private readonly _of: ForProps<T>['of'];
    private readonly _children: ForProps<T>['children'];
    private _frontBuffer = new Map<unknown, RenderedItem>();
    private _backBuffer = new Map<unknown, RenderedItem>();

    public constructor(reactiveNode: ReactiveNode, props: PropsType) {
        super(reactiveNode);

        const forProps = props as unknown as ForProps<T>;
        this._children = forProps.children;
        this._of = forProps.of;

        if (isSignal(this._of)) {
            this.setSubscription(this._of.subscribe((value) => this.renderValue(value)));
        }
    }

    public render(): void {
        this.renderValue(isSignal(this._of) ? this._of.value : this._of);
    }

    private renderValue(items: T[]): void {
        this.firstChild = this.lastChild = null as VNode | null;
        const children: RNode[] = [];
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

class VNodeShow<T> extends VNodeBuiltinComponent {
    private readonly _when: ShowProps<T>['when'];
    private readonly _is: ShowProps<T>['is'];
    private readonly _keyed: ShowProps<T>['keyed'];
    private readonly _children: ShowProps<T>['children'];
    private readonly _fallback: ShowProps<T>['fallback'] | null;
    private _shown: boolean | null = null;

    public constructor(reactiveNode: ReactiveNode, props: PropsType) {
        super(reactiveNode);

        const showProps = props as unknown as ShowProps<T>;
        this._when = showProps.when;
        this._is = showProps.is;
        this._keyed = showProps.keyed ?? false;
        this._children = showProps.children;
        this._fallback = showProps.fallback ?? null;

        if (isSignal(this._when)) {
            this.setSubscription(this._when.subscribe((value) => this.renderValue(value)));
        }
    }

    public render(): void {
        this.renderValue(isSignal(this._when) ? this._when.value : this._when);
    }

    private renderValue(value: T) {
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
            cleanupVNode(this.firstChild);
        }
        this.firstChild = this.lastChild = null;
        const jsxNode = show ? this._children : this._fallback;
        if (jsxNode) {
            const vNode = new VNodeRoot();
            this.firstChild = this.lastChild = vNode;
            const children = renderJSX(
                typeof jsxNode === 'function' ? jsxNode(value) : jsxNode,
                vNode,
            );
            this.reactiveNode.update(children);
        }
        else {
            this.reactiveNode.update(null);
        }
    }
}

class VNodeWith<T> extends VNodeBuiltinComponent {
    private readonly _value: WithProps<T>['value'];
    private readonly _children: WithProps<T>['children'];

    public constructor(reactiveNode: ReactiveNode, props: PropsType) {
        super(reactiveNode);

        const withProps = props as unknown as WithProps<T>;
        this._value = withProps.value;
        this._children = withProps.children;

        if (isSignal(this._value)) {
            this.setSubscription(this._value.subscribe((value) => this.renderValue(value)));
        }
    }

    public render(): void {
        this.renderValue(isSignal(this._value) ? this._value.value : this._value);
    }

    private renderValue(value: T) {
        if (this.firstChild) {
            cleanupVNode(this.firstChild);
        }
        const vNode = new VNodeRoot();
        this.firstChild = this.lastChild = vNode;
        const children = renderJSX(this._children(value), vNode);
        this.reactiveNode.update(children);
    }
}

class VNodeWithMany<T extends readonly unknown[]> extends VNodeBuiltinComponent {
    private readonly _values: WithManyProps<T>['values'];
    private readonly _children: WithManyProps<T>['children'];

    public constructor(reactiveNode: ReactiveNode, props: PropsType) {
        super(reactiveNode);

        const withManyProps = props as unknown as WithManyProps<T>;
        this._values = withManyProps.values;
        this._children = withManyProps.children;

        const signals: Signal<unknown>[] = [];
        for (let i = 0; i < this._values.length; ++i) {
            const value = this._values[i];
            if (isSignal(value)) {
                signals.push(value);
            }
        }
        if (signals.length > 0) {
            this.setSubscription(subscribe<unknown[]>(signals, () => {
                this.render();
            }));
        }
    }

    public render(): void {
        this.renderValue(
            ...this._values.map(value => isSignal(value) ? value.value : value) as ValuesOf<T>,
        );
    }

    private renderValue(...values: ValuesOf<T>) {
        if (this.firstChild) {
            cleanupVNode(this.firstChild);
        }
        const vNode = new VNodeRoot();
        this.firstChild = this.lastChild = vNode;
        const children = renderJSX(this._children(...values), vNode);
        this.reactiveNode.update(children);
    }
}

type BuiltinVNodeConstructor = new(
    reactiveNode: ReactiveNode,
    props: PropsType,
) => VNodeBuiltinComponent;

const BuiltinComponentMap = new Map<unknown, BuiltinVNodeConstructor>(
    [
        [For, VNodeFor],
        [Show, VNodeShow],
        [With, VNodeWith],
        [WithMany, VNodeWithMany],
    ],
);
