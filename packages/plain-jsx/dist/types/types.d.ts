import type { MaybePromise, MethodsOf, ReadonlyProps, Setter } from '@lib/utils';
import type { Properties as CSS } from 'csstype';
export type PropsType = Record<string, unknown>;
export interface VNodeElement {
    type: string | FunctionalComponent;
    props: PropsType;
    children: VNode[];
    isDev: boolean;
}
export type VNode = VNodeElement | string | number | boolean | null | undefined;
export type VNodeChildren = VNode | VNode[];
export type FunctionalComponent<TProps = PropsType, TRef = never> = (props: TProps & CustomProps, events: ComponentEvents<TRef>) => VNode;
export type RefType<T extends FunctionalComponent<never, unknown>> = T extends FunctionalComponent<never, infer TRef> ? TRef : never;
interface GetRef {
    (name: string): unknown;
    <T extends Element>(name: string): T;
    <T extends FunctionalComponent<never, unknown>>(name: string): RefType<T>;
}
export interface MountedHandlerUtils<TRef> {
    getRef: GetRef;
    defineRef: Setter<TRef>;
}
export type SetupHandler = () => Promise<void>;
export type EventHandler = () => MaybePromise<void>;
export type MountedHandler<TRef> = (utils: MountedHandlerUtils<TRef>) => MaybePromise<void>;
export type ErrorCapturedHandler = (error: unknown) => boolean | void;
export interface ComponentEvents<TRef> {
    /**
     * Registers an async handler that runs immediately after the functional component returns.
     * Useful for running asynchronous setup code within the component body (before mounting).
     *
     * Note: Rendering is deferred until all setup handlers have completed.
     * If you want to show placeholder content during data fetching, use `onMounted` instead.
     *
     * @example
     * onSetup(async () => {
     *   // Functional components can't be async, so use this for async setup.
     *   const data = await fetchData();
     * });
     */
    onSetup: (handler: SetupHandler) => void;
    /**
     * Registers a handler (can be async) that runs when the component is inserted into the active DOM.
     * The handler receives an object with helpers to get child refs or define the component's ref interface.
     *
     * @example
     * onMounted(({ getRef, defineRef }) => {
     *   const elem = getRef('elem');
     *
     *   defineRef({
     *     increment: () => { },
     *     decrement: () => { },
     *     getCount: () => { }
     *   });
     * });
     */
    onMounted: (handler: MountedHandler<TRef>) => void;
    /**
     * Registers a handler (can be async) that runs on the tick immediately after the `onMounted` event.
     * Useful for actions that require the DOM to be fully updated, such as setting focus.
     *
     * @example
     * let input;
     * onMounted(({ getRef }) => {
     *   input = getRef('input');
     * });
     * onReady(() => {
     *   input.focus();
     * });
     */
    onReady: (handler: EventHandler) => void;
    /**
     * Registers a handler that runs once, after the component's first render cycle following mount.
     */
    onRendered: (handler: EventHandler) => void;
    /**
     * Registers an error handler that captures errors occurring during the
     * functional component’s body execution, JSX render phase, and setup phase (`onSetup` event).
     */
    onErrorCaptured: (handler: ErrorCapturedHandler) => void;
}
interface CustomProps {
    ref?: string;
    children?: VNodeChildren;
}
type CommonProps<T extends Element> = (T extends ElementCSSInlineStyle ? {
    style?: CSS;
} : object) & (T extends HTMLOrSVGElement ? {
    dataset?: DOMStringMap;
} : object) & CustomProps;
type SettableProps<T extends Element> = Omit<T, keyof (ReadonlyProps<T> & MethodsOf<T> & CommonProps<T> & GlobalEventHandlers)>;
type TypedEvent<TElement extends Element, TEvent extends Event = Event> = Omit<TEvent, 'currentTarget'> & {
    currentTarget: TElement;
};
type DOMEvents<T extends Element> = {
    [K in keyof GlobalEventHandlersEventMap as `on${Capitalize<K>}`]?: (this: T, ev: TypedEvent<T, GlobalEventHandlersEventMap[K]>) => unknown;
};
export type DOMProps<T extends Element> = Partial<SettableProps<T>> & CommonProps<T> & DOMEvents<T>;
export type SVGProps<T extends SVGElement> = DOMProps<T> & Record<string, unknown>;
export {};
