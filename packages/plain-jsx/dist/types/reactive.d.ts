import { Observable } from './observable';
import type { IntermediateChildren, IntermediateNode, PropsType, VNode, VNodeChildren } from './types';
export declare class ReactiveNode {
    private readonly placeholder;
    private _children;
    get children(): IntermediateNode[];
    update(rNode: IntermediateNode[] | null): void;
}
export declare function resolveReactiveNodes(children: IntermediateNode[]): ChildNode[];
export type CustomRenderFn = (props: PropsType, children: VNodeChildren, renderChildren: (children: VNodeChildren) => IntermediateNode[]) => IntermediateChildren;
export interface ShowProps {
    when: boolean | Observable<boolean>;
    /**
     * - `true`: (default) Cache the children on the first show and re-use each time they are shown.
     * - `false`: No caching, children get rendered each time they are shown.
     */
    cache?: boolean;
    children: VNodeChildren | (() => VNode);
}
export declare const Show = "Show";
export declare const renderShow: CustomRenderFn;
export interface ForProps<T> extends PropsType {
    of: Observable<T[]>;
    children: (item: T, index: Observable<number>) => VNode;
}
export declare function For<T>(props: ForProps<T>): VNode;
export declare const renderFor: CustomRenderFn;
