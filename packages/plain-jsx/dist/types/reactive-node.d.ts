import type { DOMNode, RNode } from './types';
export declare class ReactiveNode {
    private readonly placeholder;
    private _children;
    get children(): RNode[];
    update(rNode: RNode[] | null): void;
}
export declare function resolveReactiveNodes(children: RNode[]): DOMNode[];
