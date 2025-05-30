import type { MaybePromise } from '@lib/utils';
import { hasKey, isKeyReadonly } from '@lib/utils';
import { LifecycleEvents } from './events';
import type {
    ComponentEvents,
    DOMProps,
    ErrorCapturedHandler,
    EventHandler,
    FunctionalComponent,
    MountedHandler,
    MountedHandlerUtils,
    PropsType,
    SetupHandler,
    SVGProps,
    VNode,
    VNodeChildren,
} from './types';

const XMLNamespaces = {
    'svg': 'http://www.w3.org/2000/svg' as const,
};

export const Fragment = 'Fragment';

export function createVNode(
    type: string | FunctionalComponent,
    props: PropsType = {},
    children: VNode[] = [],
    isDev = false,
): VNode {
    return { type, props, children, isDev };
}

export function jsx(
    type: string | FunctionalComponent,
    props: { children?: VNodeChildren },
): VNode {
    let children = props.children ?? [];
    children = Array.isArray(children) ? children : [children];
    delete props.children;
    return createVNode(type, props, children, false);
}

export { jsx as jsxs };

export function jsxDEV(
    type: string | FunctionalComponent,
    props: { children?: VNodeChildren },
) {
    let children = props.children ?? [];
    children = Array.isArray(children) ? children : [children];
    delete props.children;
    return createVNode(type, props, children, true);
}

export function createElement(
    tag: string | FunctionalComponent,
    props?: PropsType,
    ...children: VNode[]
): VNode {
    return createVNode(tag, props, children);
}

export async function render<TRef = unknown>(
    root: Element | DocumentFragment,
    element: VNode,
    handlers: { onMounted: (ref?: TRef) => MaybePromise<void> },
) {
    const events = new LifecycleEvents();
    const refs: { default?: TRef } = {};
    if (element && typeof element === 'object') {
        element.props['ref'] = 'default';
        events.onMounted((): MaybePromise<void> => handlers.onMounted(refs.default));
    }

    const node = await renderVNode(root, element, events, refs);
    if (node === null) {
        return;
    }

    events.listen(node);
    root.appendChild(node);
}

async function renderVNode(
    root: Element | DocumentFragment,
    element: VNode,
    events: LifecycleEvents,
    refs?: Record<string, unknown>,
): Promise<Node | null> {
    if (element === undefined || element === null || typeof element === 'boolean') {
        return null;
    }
    else if (typeof element === 'string' || typeof element === 'number') {
        return document.createTextNode(String(element));
    }

    const renderChildren = async (node: Element | DocumentFragment, children: VNode[]) => {
        const childNodes = await Promise.all(
            children.flat().map(async child => renderVNode(node, child, events, refs)),
        );
        node.append(...childNodes.filter(node => node !== null));
    };

    const { type, props, children } = element;
    if (typeof type === 'function') {
        return await renderFunctionalComponent(root, type, props, children, events, refs);
    }
    else if (type === Fragment) {
        const fragment = document.createDocumentFragment();
        await renderChildren(fragment, children);
        return fragment;
    }
    else {
        const hasNS = type.includes(':');

        const domElement = hasNS
            ? document.createElementNS(...splitNamespace(type))
            : document.createElement(type);

        // handle ref prop
        if ('ref' in props && typeof props['ref'] === 'string') {
            if (refs) {
                refs[props['ref']] = domElement;
            }
            delete props['ref'];
        }

        setProps(domElement, props);
        await renderChildren(domElement, children);
        return domElement;
    }
}

async function renderFunctionalComponent(
    root: Element | DocumentFragment,
    type: FunctionalComponent,
    props: PropsType,
    children: VNode[],
    events: LifecycleEvents,
    refs?: Record<string, unknown>,
): Promise<Node | null> {
    const componentRefs: Record<string, unknown> = {};
    const utils: MountedHandlerUtils<unknown> = {
        getRef: (key: string) => {
            if (key in componentRefs === false) {
                throw new Error(`Invalid ref key: ${key}`);
            }
            return componentRefs[key];
        },
        defineRef: (ref: unknown) => {
            if ('ref' in props && typeof props['ref'] === 'string') {
                if (refs) {
                    refs[props['ref']] = ref;
                }
            }
        },
    };

    const setupHandlers: SetupHandler[] = [];
    const errorCapturedHandlers: ErrorCapturedHandler[] = [];
    const componentEvents: ComponentEvents<unknown> = {
        onSetup: (handler: SetupHandler) => setupHandlers.push(handler),
        onMounted: (handler: MountedHandler<unknown>) =>
            events.onMounted((): MaybePromise<void> => handler(utils)),
        onReady: (handler: EventHandler) => events.onReady(handler),
        onRendered: (handler: EventHandler) => events.onRendered(handler),
        onErrorCaptured: (handler: ErrorCapturedHandler) => errorCapturedHandlers.push(handler),
    };

    let node: Node | null = null;
    events.pushLevel();
    try {
        const vNode = type({ ...props, children }, componentEvents);
        await Promise.all(setupHandlers.map((setupHandler): MaybePromise<void> => setupHandler()));
        node = await renderVNode(root, vNode, events, componentRefs);
    }
    catch (error) {
        const handled = errorCapturedHandlers.some(errorCapturedHandler =>
            errorCapturedHandler(error) === false
        );
        if (!handled) {
            throw error;
        }
    }
    finally {
        events.popLevel();
    }
    return node;
}

function setProps<T extends HTMLElement | SVGElement>(elem: T, props: object) {
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'style' && value instanceof Object) {
            Object.assign(elem.style, value);
        }
        else if (key === 'dataset' && value instanceof Object) {
            Object.assign(elem.dataset, value);
        }
        else if (/^on[A-Z]/.exec(key)) {
            elem.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
        }
        else if (hasKey(elem, key) && !isKeyReadonly(elem, key)) {
            Object.assign(elem, { [key]: value as unknown });
        }
        else {
            if (key.includes(':')) {
                elem.setAttributeNS(splitNamespace(key)[0], key, String(value));
            }
            else {
                elem.setAttribute(key, String(value));
            }
        }
    });
}

function splitNamespace(tagNS: string) {
    const [ns, tag] = tagNS.split(':', 1);
    if (!hasKey(XMLNamespaces, ns)) {
        throw new Error('Invalid namespace');
    }
    return [XMLNamespaces[ns], tag] as const;
}

type DOMElement = Element;

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace JSX {
    /* utility */
    type PropsOf<T extends DOMElement> = T extends SVGElement ? SVGProps<T> : DOMProps<T>;

    /* jsx defs */
    type Fragment = typeof Fragment;

    type Element = VNode;

    type BaseIntrinsicElements =
        & {
            [K in keyof HTMLElementTagNameMap]: PropsOf<HTMLElementTagNameMap[K]>;
        }
        & {
            [K in keyof SVGElementTagNameMap as `svg:${K}`]: PropsOf<SVGElementTagNameMap[K]>;
        };

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface IntrinsicElements extends BaseIntrinsicElements {
        // allow extending
    }
}
