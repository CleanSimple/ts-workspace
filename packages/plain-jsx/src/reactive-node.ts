import type { DOMNode, RNode } from './types';

import { updateChildren } from './dom';

export class ReactiveNode {
    private readonly _placeholder = document.createComment('');
    private _children: RNode[] = [this._placeholder];

    public get children() {
        return this._children;
    }

    public update(rNode: RNode[] | null) {
        if (rNode === null || rNode.length === 0) { // clearing
            if (this._children[0] === this._placeholder) {
                return; // we are already cleared
            }

            rNode = [this._placeholder];
        }

        const children = resolveReactiveNodes(this._children);
        const parent = children[0].parentNode;
        if (parent) {
            const newChildren = resolveReactiveNodes(rNode);
            updateChildren(parent, children, newChildren);
        }

        this._children = rNode;
    }
}

export function resolveReactiveNodes(children: RNode[]): DOMNode[] {
    const childNodes: DOMNode[] = [];
    const queue = new Array<RNode>();

    queue.push(...children);
    while (queue.length > 0) {
        const child = queue.shift()!;

        if (child instanceof ReactiveNode) {
            queue.unshift(...child.children);
        }
        else {
            childNodes.push(child);
        }
    }
    return childNodes;
}
