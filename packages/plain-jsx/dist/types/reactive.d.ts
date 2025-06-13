import { Observable } from './observable';
import type { PropsType, RNode, VNode, VNodeChildren } from './types';
export declare class ReactiveNode {
    private readonly placeholder;
    private children;
    update(rNode: RNode): void;
    getRoot(): ChildNode[];
}
export type CustomRenderFn = (props: PropsType, children: VNodeChildren, renderChildren: (children: VNodeChildren) => ChildNode[]) => RNode;
export interface ShowProps {
    when: Observable<boolean>;
    /**
     * - `true`: (default) Cache the children on the first show and re-use each time they are shown.
     * - `false`: No caching, children get rendered each time they are shown.
     */
    cache?: boolean;
    children: VNodeChildren | (() => VNode);
}
export declare const Show = "Show";
export declare const renderShow: CustomRenderFn;
export interface WithProps<T> {
    value: Observable<T>;
    children: (value: T) => VNode;
}
export declare function With<T>(props: WithProps<T>): VNode;
export declare const renderWith: CustomRenderFn;
export interface ForProps<T> extends PropsType {
    of: Observable<T[]>;
    children: (item: T, index: Observable<number>) => VNode;
}
export declare function For<T>(props: ForProps<T>): VNode;
export declare const renderFor: CustomRenderFn;
