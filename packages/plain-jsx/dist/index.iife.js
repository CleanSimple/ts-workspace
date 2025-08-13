var PlainJSX = (function (exports) {
    'use strict';

    let callbacks = new Array();
    let queued = false;
    function runNextTickCallbacks() {
        queued = false;
        for (const callback of callbacks) {
            void callback();
        }
        callbacks = [];
    }
    function nextTick(callback) {
        callbacks.push(callback);
        if (queued) {
            return;
        }
        queued = true;
        queueMicrotask(runNextTickCallbacks);
    }

    class Sentinel {
        static Instance = new Sentinel();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        constructor() { }
    }
    const _Sentinel = Sentinel.Instance;

    class Observable {
        computed(compute) {
            return new ComputedSingle(compute, this);
        }
    }
    /** internal use */
    class ObservableImpl extends Observable {
        observers = [];
        immediateObservers = [];
        hasDeferredNotifications = false;
        notifyObserversCallback;
        constructor() {
            super();
            this.notifyObserversCallback = this.notifyObservers.bind(this);
        }
        onUpdated() {
            if (this.immediateObservers.length) {
                const value = this.value;
                for (const observer of this.immediateObservers) {
                    observer(value);
                }
            }
            if (this.observers.length) {
                if (this.hasDeferredNotifications) {
                    return;
                }
                this.hasDeferredNotifications = true;
                nextTick(this.notifyObserversCallback);
            }
        }
        notifyObservers() {
            this.hasDeferredNotifications = false;
            const value = this.value;
            for (const observer of this.observers) {
                observer(value);
            }
        }
        subscribe(observer, immediate = true) {
            const observers = immediate ? this.immediateObservers : this.observers;
            if (!observers.includes(observer)) {
                observers.push(observer);
            }
            return {
                unsubscribe: this.unsubscribe.bind(this, observer, immediate),
            };
        }
        unsubscribe(observer, immediate) {
            const observers = immediate ? this.immediateObservers : this.observers;
            const index = observers.indexOf(observer);
            if (index > -1) {
                observers.splice(index, 1);
            }
        }
    }
    /**
     * Simple observable value implementation
     */
    class Val extends ObservableImpl {
        _value;
        constructor(initialValue) {
            super();
            this._value = initialValue;
        }
        get value() {
            return this._value;
        }
        set value(newValue) {
            if (this._value === newValue) {
                return;
            }
            this._value = newValue;
            this.onUpdated();
        }
    }
    /** internal use */
    class ComputedSingle extends Observable {
        observable;
        compute;
        _value;
        constructor(compute, observable) {
            super();
            this.compute = compute;
            this.observable = observable;
            this._value = compute(observable.value);
        }
        get value() {
            return this._value;
        }
        subscribe(observer, immediate) {
            return this.observable.subscribe((value) => {
                this._value = this.compute(value);
                observer(this._value);
            }, immediate);
        }
    }
    /** internal use */
    class Computed extends ObservableImpl {
        observables;
        compute;
        _value;
        constructor(observables, compute) {
            super();
            this.compute = compute;
            this.observables = observables;
            this._value = _Sentinel;
            for (const observable of observables) {
                observable.subscribe(() => {
                    this._value = _Sentinel;
                    this.onUpdated();
                }, true);
            }
        }
        get value() {
            if (this._value instanceof Sentinel) {
                this._value = this.compute(...this.observables.map(observable => observable.value));
            }
            return this._value;
        }
    }
    function val(initialValue) {
        return new Val(initialValue);
    }
    function computed(observables, compute) {
        return new Computed(observables, compute);
    }
    function ref() {
        return new Val(null);
    }

    class ReactiveNode {
        placeholder = document.createComment('');
        _children = [this.placeholder];
        get children() {
            return this._children;
        }
        update(rNode) {
            const children = resolveReactiveNodes(this._children);
            if (rNode === null || rNode.length === 0) {
                // optimized clear path
                if (this._children.length === 1 && this._children[0] === this.placeholder) {
                    return; // we are already cleared
                }
                const first = children.values().next().value;
                const parent = first?.parentNode;
                if (parent) {
                    parent.insertBefore(this.placeholder, first);
                    const fragment = document.createDocumentFragment();
                    fragment.append(...children);
                }
                this._children = [this.placeholder];
                return;
            }
            const newChildren = resolveReactiveNodes(rNode);
            const newChildrenSet = new Set(newChildren);
            const first = children.values().next().value;
            const parent = first?.parentNode;
            if (parent) {
                const domChildren = parent.childNodes;
                const currentChildrenSet = new Set(children);
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
            this._children = rNode;
        }
    }
    function resolveReactiveNodes(children) {
        return children.flatMap((vNode) => vNode instanceof ReactiveNode ? resolveReactiveNodes(vNode.children) : vNode);
    }
    const Show = 'Show';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function For(props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }

    const Fragment = 'Fragment';
    // export let initialRenderDone = false;
    function render(root, vNode) {
        root.append(...resolveReactiveNodes(renderChildren(vNode)));
        // initialRenderDone = true;
    }
    function renderChildren(children) {
        const normalizedChildren = Array.isArray(children)
            ? children.flat(10)
            : [children];
        const childNodes = [];
        for (const vNode of normalizedChildren) {
            if (vNode == null || typeof vNode === 'boolean') {
                continue;
            }
            else if (typeof vNode === 'string' || typeof vNode === 'number') {
                childNodes.push(document.createTextNode(String(vNode)));
            }
            else if (vNode instanceof Observable) {
                const reactiveNode = new ReactiveNode();
                let children = renderChildren(vNode.value);
                reactiveNode.update(children);
                vNode.subscribe((value) => {
                    if ((typeof value === 'string' || typeof value === 'number')
                        && children instanceof Node && children.nodeType === Node.TEXT_NODE) {
                        // optimized update path for text nodes
                        children.textContent = value.toString();
                    }
                    else {
                        children = renderChildren(value);
                        reactiveNode.update(children);
                    }
                });
                childNodes.push(reactiveNode);
            }
            else {
                childNodes.push(vNode);
            }
        }
        return childNodes;
    }

    exports.For = For;
    exports.Fragment = Fragment;
    exports.Show = Show;
    exports.computed = computed;
    exports.nextTick = nextTick;
    exports.ref = ref;
    exports.render = render;
    exports.val = val;

    return exports;

})({});
