import { updateChildren } from './dom.esm.js';

class ReactiveNode {
    _placeholder = document.createComment('');
    _children = [this._placeholder];
    get children() {
        return this._children;
    }
    update(rNode) {
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
function resolveReactiveNodes(children) {
    const childNodes = [];
    const queue = new Array();
    queue.push(...children);
    while (queue.length > 0) {
        const child = queue.shift();
        if (child instanceof ReactiveNode) {
            queue.unshift(...child.children);
        }
        else {
            childNodes.push(child);
        }
    }
    return childNodes;
}

export { ReactiveNode, resolveReactiveNodes };
