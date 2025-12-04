import type { DOMProps, JSXNode, SVGProps } from './types';

export type { Signal, Subscription, Task, Val } from '@cleansimple/plain-signals';
export type { JSX } from './jsx';
export type { Ref } from './ref';
export type { FunctionalComponent } from './types';

export { computed, subscribe, task, val } from '@cleansimple/plain-signals';
export { For } from './components/For';
export { Fragment } from './components/Fragment';
export { Show } from './components/Show';
export { With } from './components/With';
export { WithMany } from './components/WithMany';
export { render } from './core';
export { onCleanup, onMount, watch, watchMany } from './lifecycle';
export { ref } from './ref';
export { nextTick } from './scheduling';

/**
 * A utility for extending a DOM element's props
 * @example
 * interface DivProps extends PropsOf<HTMLDivElement> {
 *     myProp: string;
 * }
 * const Div: FunctionalComponent<DivProps> = ({ myProp, children, ...props }) => {
 *     console.log(myProp);
 *     return <div {...props}>{children}</div>;
 * };
 */
export type PropsOf<T extends Element> = T extends SVGElement ? SVGProps<T> : DOMProps<T>;

/** To be extended by components with children */
export interface ParentComponent {
    children?: JSXNode;
}
