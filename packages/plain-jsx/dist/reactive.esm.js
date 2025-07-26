import { MultiEntryCache } from './cache.esm.js';
import { Observable, val } from './observable.esm.js';

class ReactiveNode {
    placeholder = document.createComment('');
    children = new Set([this.placeholder]);
    update(rNode) {
        if (rNode === null || (Array.isArray(rNode) && rNode.length === 0)) {
            // optimized clear path
            if (this.children.has(this.placeholder)) {
                return; // we are already cleared
            }
            const first = this.children.values().next().value;
            const parent = first?.parentNode;
            if (parent) {
                parent.insertBefore(this.placeholder, first);
                const fragment = document.createDocumentFragment();
                fragment.append(...this.children);
            }
            this.children = new Set([this.placeholder]);
            return;
        }
        const newChildren = Array.isArray(rNode) ? rNode : [rNode];
        const newChildrenSet = new Set(newChildren);
        const first = this.children.values().next().value;
        const parent = first?.parentNode;
        if (parent) {
            const domChildren = parent.childNodes;
            const currentChildrenSet = this.children;
            if (currentChildrenSet.size === domChildren.length
                && newChildrenSet.isDisjointFrom(currentChildrenSet)) {
                // optimized replace path
                parent.replaceChildren(...newChildren);
            }
            else {
                const fragment = document.createDocumentFragment(); // used in bulk updates
                const replaceCount = Math.min(currentChildrenSet.size, newChildren.length);
                const replacedSet = new Set();
                const start = Array.prototype.indexOf.call(domChildren, first);
                for (let i = 0; i < replaceCount; ++i) {
                    const child = domChildren[start + i];
                    const newChild = newChildren[i];
                    if (!child) {
                        parent.append(...newChildren.slice(i));
                        break;
                    }
                    else if (!currentChildrenSet.has(child)) {
                        fragment.append(...newChildren.slice(i));
                        parent.insertBefore(fragment, child);
                        break;
                    }
                    else if (child !== newChild) {
                        if (!replacedSet.has(newChild)) {
                            parent.replaceChild(newChild, child);
                            replacedSet.add(child);
                        }
                        else {
                            parent.insertBefore(newChild, child);
                        }
                    }
                }
                if (currentChildrenSet.size > newChildren.length) {
                    // appending the excess children to the fragment will move them from their current parent to the fragment effectively removing them.
                    fragment.append(...currentChildrenSet.difference(newChildrenSet));
                }
                else if (currentChildrenSet.size < newChildren.length) {
                    fragment.append(...newChildren.slice(replaceCount));
                    parent.insertBefore(fragment, newChildren[replaceCount - 1].nextSibling);
                }
            }
        }
        this.children = newChildrenSet;
    }
    getRoot() {
        if (!this.children.size)
            throw new Error('?!?!?!?');
        return [...this.children];
    }
}
const Show = 'Show';
const renderShow = (props, children, renderChildren) => {
    const { when, cache } = props;
    const childrenOrFn = children;
    const getChildren = typeof childrenOrFn === 'function' ? childrenOrFn : () => childrenOrFn;
    let childNodes = null;
    const render = cache === false
        ? () => renderChildren(getChildren())
        : () => childNodes ??= renderChildren(getChildren());
    const reactiveNode = new ReactiveNode();
    if (when instanceof Observable) {
        if (when.value) {
            reactiveNode.update(render());
        }
        when.subscribe((value) => {
            reactiveNode.update(value ? render() : null);
        });
    }
    else {
        if (when) {
            reactiveNode.update(render());
        }
    }
    return reactiveNode.getRoot();
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function For(props) {
    throw new Error('This component cannot be called directly — it must be used through the render function.');
}
const renderFor = (props, children, renderChildren) => {
    const { of } = props;
    if (of instanceof Observable === false) {
        throw new Error("The 'of' prop on <For> is required and must be an Observable.");
    }
    if (typeof children !== 'function') {
        throw new Error('The <For> component must have exactly one child — a function that maps each item.');
    }
    const mapFn = children;
    let cache = new MultiEntryCache();
    const render = (value, index) => {
        let item = cache.get(value);
        if (!item) {
            const indexObservable = val(index);
            item = [indexObservable, renderChildren(mapFn(value, indexObservable))];
            cache.add(value, item);
        }
        else {
            item[0].value = index;
        }
        return [value, item];
    };
    const reactiveNode = new ReactiveNode();
    const childNodes = of.value.map(render);
    cache = new MultiEntryCache(childNodes);
    reactiveNode.update(childNodes.flatMap(([, item]) => item[1]));
    of.subscribe((items) => {
        const childNodes = items.map(render);
        cache = new MultiEntryCache(childNodes);
        reactiveNode.update(childNodes.flatMap(([, item]) => item[1]));
    });
    return reactiveNode.getRoot();
};

export { For, ReactiveNode, Show, renderFor, renderShow };
