import type { DOMNode } from './types';
export declare class ReactiveNode {
    private readonly placeholder;
    private _children;
    get children(): DOMNode[];
    update(rNode: DOMNode[] | null): void;
}
export declare function resolveReactiveNodes(children: DOMNode[]): ChildNode[];
