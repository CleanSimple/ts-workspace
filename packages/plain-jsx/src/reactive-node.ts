import { reconcileChildren } from './dom';
import type { DOMNode } from './types';

export class ReactiveNode {
    private readonly placeholder = document.createComment('');
    private _children: DOMNode[] = [this.placeholder];

    public get children() {
        return this._children;
    }

    public update(rNode: DOMNode[] | null) {
        if (rNode === null || rNode.length === 0) { // clearing
            if (this._children[0] === this.placeholder) {
                return; // we are already cleared
            }

            rNode = [this.placeholder];
        }

        const children = resolveReactiveNodes(this._children);
        const parent = children[0].parentNode;
        if (parent) {
            const newChildren = resolveReactiveNodes(rNode);
            reconcileChildren(parent, children, newChildren);
        }

        this._children = rNode;
    }
}

export function resolveReactiveNodes(children: DOMNode[]): ChildNode[] {
    const childNodes: ChildNode[] = [];
    const queue = new Array<DOMNode>();

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
