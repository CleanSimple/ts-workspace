import type { MaybePromise } from '@cleansimple/utils-js';
import type { ForCallbackProps, ForProps } from './components/For';
import type { ShowProps } from './components/Show';
import type { Observable, Subscription, Val } from './observable';
import type {
    DOMProps,
    FunctionalComponent,
    JSXElement,
    JSXNode,
    PropsType,
    RNode,
    SVGProps,
    VNode,
    VNodeBuiltinComponent,
    VNodeElement,
    VNodeFunctionalComponent,
    VNodeObservable,
    VNodeText,
} from './types';

import { For } from './components/For';
import { Show } from './components/Show';
import { patchNode, setProps } from './dom';
import { defineRef, mountNodes, setCurrentFunctionalComponent } from './lifecycle';
import { ObservableImpl, val, ValImpl } from './observable';
import { ReactiveNode, resolveReactiveNodes } from './reactive-node';
import { runAsync } from './scheduling';
import { splitNamespace } from './utils';

export const Fragment = 'Fragment';

export function jsx(type: string | FunctionalComponent, props: PropsType): JSXElement {
    return { type, props };
}

export { jsx as jsxDEV, jsx as jsxs };

export function render(root: Element | DocumentFragment, jsxNode: JSXNode): void {
    const children = resolveReactiveNodes(renderJSX(jsxNode, null));
    root.append(...children);
    mountNodes(children);
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
            else if (node.type === For) {
                const reactiveNode = new ReactiveNode();
                const vNode = new VNodeFor(reactiveNode, node.props, parent);

                appendVNodeChild(parent, vNode);

                domNodes.push(reactiveNode);
            }
            else if (node.type === Show) {
                const reactiveNode = new ReactiveNode();
                const vNode = new VNodeShow(reactiveNode, node.props, parent);

                appendVNodeChild(parent, vNode);

                domNodes.push(reactiveNode);
            }
            else if (typeof node.type === 'function') {
                const vNode = new VNodeFunctionalComponentImpl(node.props, parent);

                setCurrentFunctionalComponent(vNode);
                const jsxNode = node.type(node.props, { defineRef });
                setCurrentFunctionalComponent(null);

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

class VNodeFunctionalComponentImpl implements VNodeFunctionalComponent {
    public readonly type: 'component';
    public ref: object | null = null;
    public isMounted: boolean = false;
    public mountedChildrenCount: number = 0;
    public onMountCallback: (() => MaybePromise<void>) | null = null;
    public onUnmountCallback: (() => MaybePromise<void>) | null = null;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private readonly refVal: Val<object | null> | null = null;

    public constructor(props: PropsType, parent: VNode | null) {
        this.type = 'component';
        this.parent = parent;

        if (props.ref instanceof ValImpl) {
            this.refVal = props.ref;
        }
    }

    public onMount(): void {
        if (this.refVal) {
            this.refVal.value = this.ref;
        }

        if (this.onMountCallback) {
            runAsync(this.onMountCallback);
        }

        this.isMounted = true;
    }

    public onUnmount(): void {
        if (this.onUnmountCallback) {
            runAsync(this.onUnmountCallback);
        }

        if (this.refVal) {
            this.refVal.value = null;
        }

        this.mountedChildrenCount = 0; // for when forcing an unmount
        this.isMounted = false;
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

    public onUnmount(): void {
        if (this.subscriptions) {
            for (const subscription of this.subscriptions) {
                subscription.unsubscribe();
            }
            this.subscriptions = null;
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

    private subscription: Subscription | null = null;
    private _renderedChildren: RNode[] | null = null;

    public constructor(ref: ReactiveNode, value: Observable<JSXNode>, parent: VNode | null) {
        this.type = 'observable';
        this.parent = parent;
        this.ref = ref;

        this.render(value.value);
        this.subscription = value.subscribe((value: JSXNode) => this.render(value));
    }

    public render(jsxNode: JSXNode): void {
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

    public onUnmount(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
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

    private subscription: Subscription | null = null;
    private frontBuffer = new Map<unknown, RenderedItem>();
    private backBuffer = new Map<unknown, RenderedItem>();
    private readonly mapFn: (props: ForCallbackProps<T>) => JSXNode;

    public constructor(ref: ReactiveNode, props: PropsType, parent: VNode | null) {
        this.type = 'builtin';
        this.parent = parent;
        this.ref = ref;

        const typedProps = props as unknown as ForProps<T>;
        if (typeof typedProps.children !== 'function') {
            throw new Error(
                'The <For> component must have exactly one child — a function that maps each item.',
            );
        }
        this.mapFn = typedProps.children;

        if (Array.isArray(typedProps.of)) {
            this.render(typedProps.of);
        }
        else if (typedProps.of instanceof ObservableImpl) {
            this.render(typedProps.of.value as T[]);
            this.subscription = typedProps.of.subscribe((value: T[]) => this.render(value));
        }
        else {
            throw new Error(
                "The 'of' prop on <For> is required and must be an array or an observable array.",
            );
        }
    }

    public render(items: T[]) {
        this.firstChild = this.lastChild = null;
        const n = items.length;
        for (let i = 0; i < n; i++) {
            const value = items[i];
            let item = this.frontBuffer.get(value);
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

            this.backBuffer.set(value, item);
        }
        if (this.lastChild) {
            this.lastChild.next = null;
        }

        this.ref.update(this.firstChild ? resolveRenderedVNodes(this.firstChild) : null);

        [this.frontBuffer, this.backBuffer] = [this.backBuffer, this.frontBuffer];
        this.backBuffer.clear();
    }

    public onUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}

class VNodeShow implements VNodeBuiltinComponent {
    public readonly type: 'builtin';
    public readonly ref: ReactiveNode;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private readonly childrenOrFn: ShowProps['children'];
    private subscription: Subscription | null = null;

    public constructor(ref: ReactiveNode, props: PropsType, parent: VNode | null) {
        this.type = 'builtin';
        this.parent = parent;
        this.ref = ref;

        const showProps = props as unknown as ShowProps;
        const when = showProps.when;
        this.childrenOrFn = showProps.children;

        if (typeof when === 'boolean') {
            this.render(when);
        }
        else if (when instanceof ObservableImpl) {
            this.render(when.value as boolean);
            this.subscription = when.subscribe((value: boolean) => this.render(value));
        }
        else {
            throw new Error(
                "The 'when' prop on <Show> is required and must be a boolean or an observable boolean.",
            );
        }
    }

    public render(value: boolean) {
        if (value) {
            this.firstChild = this.lastChild = null;
            const children = renderJSX(
                typeof this.childrenOrFn === 'function'
                    ? this.childrenOrFn()
                    : this.childrenOrFn,
                this,
            );
            this.ref.update(children);
        }
        else {
            this.firstChild = this.lastChild = null;
            this.ref.update(null);
        }
    }

    public onUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}

type DOMElement = Element;

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace JSX {
    /* utility */
    type PropsOf<T extends DOMElement> = T extends SVGElement ? SVGProps<T> : DOMProps<T>;

    /* jsx defs */
    type Fragment = typeof Fragment;

    type Element = JSXNode;

    type BaseIntrinsicElements =
        & {
            [K in keyof HTMLElementTagNameMap]: DOMProps<HTMLElementTagNameMap[K]>;
        }
        & {
            [K in keyof SVGElementTagNameMap as `svg:${K}`]: SVGProps<SVGElementTagNameMap[K]>;
        };

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends BaseIntrinsicElements {
    }
}
