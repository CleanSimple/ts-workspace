import { MultiEntryCache } from './cache.esm.js';
import { patchChildren } from './domPatch.esm.js';
import { Observable, val } from './observable.esm.js';

class ReactiveNode {
    placeholder = document.createComment('');
    _children = [this.placeholder];
    get children() {
        return this._children;
    }
    update(rNode) {
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
            patchChildren(parent, children, newChildren);
        }
        this._children = rNode;
    }
}
function resolveReactiveNodes(children) {
    return children.flatMap((vNode) => vNode instanceof ReactiveNode ? resolveReactiveNodes(vNode.children) : vNode);
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
    return reactiveNode;
};
function For(_props) {
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
    const cache = new MultiEntryCache();
    const render = (value, index) => {
        let item = cache.get(value);
        if (item) {
            item.index.value = index;
        }
        else {
            const indexObservable = val(index);
            item = {
                index: indexObservable,
                children: renderChildren(mapFn(value, indexObservable)),
            };
        }
        return [value, item];
    };
    const reactiveNode = new ReactiveNode();
    const childNodes = of.value.map(render);
    reactiveNode.update(childNodes.flatMap(([, item]) => item.children));
    cache.clear();
    cache.addRange(childNodes);
    of.subscribe((items) => {
        const childNodes = items.map(render);
        reactiveNode.update(childNodes.flatMap(([, item]) => item.children));
        cache.clear();
        cache.addRange(childNodes);
    });
    return reactiveNode;
};

export { For, ReactiveNode, Show, renderFor, renderShow, resolveReactiveNodes };
