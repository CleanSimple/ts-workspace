import type { MaybePromise } from '@cleansimple/utils-js';
import { MultiEntryCache } from './cache';
import { For, type ForCallbackProps, type ForProps } from './components/For';
import { Show, type ShowProps } from './components/Show';
import { observeProps, patchNode, setProps } from './dom';
import { mountNodes } from './lifecycle-events';
import {
    type Observable,
    ObservableImpl,
    type Subscription,
    type Val,
    val,
    ValImpl,
} from './observable';
import { ReactiveNode, resolveReactiveNodes } from './reactive-node';
import { runAsync } from './scheduling';
import type {
    DOMNode,
    DOMProps,
    FunctionalComponent,
    JSXElement,
    JSXNode,
    PropsType,
    SVGProps,
    VNode,
    VNodeBuiltinComponent,
    VNodeElement,
    VNodeFunctionalComponent,
    VNodeObservable,
    VNodeText,
} from './types';
import { splitNamespace } from './utils';

export const Fragment = 'Fragment';

export function jsx(
    type: string | FunctionalComponent,
    props: PropsType,
): JSXElement {
    return { type, props };
}

export { jsx as jsxDEV, jsx as jsxs };

// export let initialRenderDone = false;
export function render(root: Element | DocumentFragment, jsxNode: JSXNode): void {
    const children = resolveReactiveNodes(renderJSX(jsxNode, null));
    root.append(...children);
    mountNodes(children);
    // initialRenderDone = true;
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

function renderJSX(jsxNode: JSXNode, parent: VNode | null, domNodes: DOMNode[] = []): DOMNode[] {
    const nodes: JSXNode[] = [];

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

                setProps(domElement as HTMLElement, node.props);
                if (parent?.type === 'element') {
                    const subscriptions = observeProps(domElement as HTMLElement, node.props);
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
                    vNode.subscriptions = observeProps(domElement as HTMLElement, node.props);
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
                const defineRef = (ref: object) => {
                    vNode.ref = ref;
                };
                const onMount = (fn: () => MaybePromise<void>) => {
                    vNode.onMountCallback = fn;
                };
                const onUnmount = (fn: () => MaybePromise<void>) => {
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

function resolveRenderedVNodes(vNodes: VNode, childNodes: DOMNode[] = []) {
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

class _VNodeText implements VNodeText {
    public readonly type: 'text';
    public readonly value: string | number;
    public readonly ref: Text;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    public constructor(ref: Text, value: string | number, parent: VNode | null) {
        this.type = 'text';
        this.value = value;
        this.parent = parent;
        this.ref = ref;
    }
}

class _VNodeFunctionalComponent implements VNodeFunctionalComponent {
    public readonly type: 'component';
    public readonly value: FunctionalComponent;
    public readonly props: PropsType;
    public ref: object | null = null;
    public isMounted: boolean = false;
    public mountedChildrenCount: number = 0;
    public onMountCallback: (() => MaybePromise<void>) | null = null;
    public onUnmountCallback: (() => MaybePromise<void>) | null = null;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    public constructor(value: FunctionalComponent, props: PropsType, parent: VNode | null) {
        this.type = 'component';
        this.value = value;
        this.props = props;
        this.parent = parent;
    }

    public onMount(): void {
        if (this.props.ref instanceof ValImpl) {
            this.props.ref.value = this.ref;
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

        if (this.props.ref instanceof ValImpl) {
            this.props.ref.value = null;
        }

        this.mountedChildrenCount = 0; // for when forcing an unmount
        this.isMounted = false;
    }
}

class _VNodeElement implements VNodeElement {
    public readonly type: 'element';
    public readonly value: string;
    public readonly props: PropsType;
    public readonly ref: Element;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    public subscriptions: Subscription[] | null = null;

    public constructor(ref: Element, value: string, props: PropsType, parent: VNode | null) {
        this.type = 'element';
        this.value = value;
        this.props = props;
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

class _VNodeObservable implements VNodeObservable {
    public readonly type: 'observable';
    public readonly value: Observable<JSXNode>;
    public readonly ref: ReactiveNode;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private subscription: Subscription | null = null;
    private _renderedChildren: DOMNode[] | null = null;

    public constructor(ref: ReactiveNode, value: Observable<JSXNode>, parent: VNode | null) {
        this.type = 'observable';
        this.value = value;
        this.parent = parent;
        this.ref = ref;

        this.render(value.value);
        this.subscription = value.subscribe(this.render.bind(this));
    }

    public render(jsxNode: JSXNode): void {
        if (
            (typeof jsxNode === 'string' || typeof jsxNode === 'number')
            && this._renderedChildren?.length === 1
            && this._renderedChildren[0] instanceof Node
            && this._renderedChildren[0].nodeType === Node.TEXT_NODE
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

class _VNodeFor<T> implements VNodeBuiltinComponent {
    public readonly type: 'builtin';
    public readonly value: FunctionalComponent;
    public readonly props: PropsType;
    public readonly ref: ReactiveNode;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private subscription: Subscription | null = null;
    private readonly cache = new MultiEntryCache<RenderedItem>();
    private readonly mapFn: (props: ForCallbackProps<T>) => JSXNode;

    public constructor(ref: ReactiveNode, props: PropsType, parent: VNode | null) {
        this.type = 'builtin';
        this.value = For as FunctionalComponent;
        this.props = props;
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
            this.subscription = typedProps.of.subscribe(this.render.bind(this));
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
        const renderedItems: [unknown, RenderedItem][] = [];
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

    public onUnmount() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}

class _VNodeShow implements VNodeBuiltinComponent {
    public readonly type: 'builtin';
    public readonly value: FunctionalComponent;
    public readonly props: PropsType;
    public readonly ref: ReactiveNode;
    public parent: VNode | null;
    public next: VNode | null = null;
    public firstChild: VNode | null = null;
    public lastChild: VNode | null = null;

    private subscription: Subscription | null = null;

    public constructor(ref: ReactiveNode, props: PropsType, parent: VNode | null) {
        this.type = 'builtin';
        this.value = Show as FunctionalComponent;
        this.props = props;
        this.parent = parent;
        this.ref = ref;

        const when = (props as unknown as ShowProps).when;
        if (typeof when === 'boolean') {
            this.render(when);
        }
        else if (when instanceof ObservableImpl) {
            this.render(when.value as boolean);
            this.subscription = when.subscribe(this.render.bind(this));
        }
        else {
            throw new Error(
                "The 'when' prop on <Show> is required and must be a boolean or an observable boolean.",
            );
        }
    }

    public render(value: boolean) {
        if (value) {
            const childrenOrFn = this.props.children as ShowProps['children'];

            this.firstChild = this.lastChild = null;
            const children = renderJSX(
                typeof childrenOrFn === 'function'
                    ? childrenOrFn()
                    : childrenOrFn,
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
            [K in keyof HTMLElementTagNameMap]: PropsOf<HTMLElementTagNameMap[K]>;
        }
        & {
            [K in keyof SVGElementTagNameMap as `svg:${K}`]: PropsOf<SVGElementTagNameMap[K]>;
        };

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends BaseIntrinsicElements {
    }
}
