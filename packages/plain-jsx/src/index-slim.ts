import type { DOMProps, JSXNode, SVGProps } from './types';

export type { JSX } from './jsx';
export type { Ref } from './ref';
export type { FunctionalComponent } from './types';

export { onCleanup, onMount, watch, watchMany } from './lifecycle';
export { ref } from './ref';
export { render } from './renderer';
export { nextTick } from './scheduler';

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
