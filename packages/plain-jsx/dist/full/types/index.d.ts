import { SVGProps, DOMProps, JSXNode } from './types.js';
export { FunctionalComponent } from './types.js';
export { Signal, Subscription, Task, Val, computed, subscribe, task, val } from '@cleansimple/plain-signals';
export { JSX } from './jsx.js';
export { Ref, ref } from './ref.js';
export { For } from './components/For.js';
export { Fragment } from './components/Fragment.js';
export { Show } from './components/Show.js';
export { With } from './components/With.js';
export { WithMany } from './components/WithMany.js';
export { onCleanup, onMount, watch, watchMany } from './lifecycle.js';
export { render } from './renderer.js';
export { nextTick } from './scheduler.js';

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
type PropsOf<T extends Element> = T extends SVGElement ? SVGProps<T> : DOMProps<T>;
/** To be extended by components with children */
interface ParentComponent {
    children?: JSXNode;
}

export type { ParentComponent, PropsOf };
