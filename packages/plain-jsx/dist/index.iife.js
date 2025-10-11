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

    const _Fragment = document.createDocumentFragment();
    function patchChildren(parent, current, target) {
        const newIndexMap = new Map(target.map((node, index) => [node, index]));
        const newIndexToOldIndexMap = new Int32Array(target.length).fill(-1);
        const nodeAfterEnd = current[current.length - 1].nextSibling; // `current` should never be empty, so this is safe
        let maxNewIndexSoFar = -1;
        let moved = false;
        const toRemove = new Array();
        for (let i = 0; i < current.length; ++i) {
            const oldNode = current[i];
            const newIndex = newIndexMap.get(oldNode);
            if (newIndex === undefined) {
                toRemove.push(oldNode);
            }
            else {
                newIndexToOldIndexMap[newIndex] = i;
                if (newIndex < maxNewIndexSoFar)
                    moved = true;
                else
                    maxNewIndexSoFar = newIndex;
            }
        }
        // remove old nodes
        _Fragment.append(...toRemove);
        _Fragment.textContent = null;
        // compute longest increasing subsequence
        const lis = moved ? getLIS(newIndexToOldIndexMap) : [];
        const ops = [];
        let currentOp = null;
        let j = lis.length - 1;
        for (let i = target.length - 1; i >= 0; --i) {
            const newNode = target[i];
            const nextPos = target.at(i + 1) ?? nodeAfterEnd;
            if (newIndexToOldIndexMap[i] === -1) {
                if (currentOp?.type === 'insert') {
                    currentOp.nodes.unshift(newNode);
                }
                else {
                    currentOp = { type: 'insert', pos: nextPos, nodes: [newNode] };
                    ops.push(currentOp);
                }
                continue;
            }
            else if (moved) {
                if (j < 0 || i !== lis[j]) {
                    if (currentOp?.type === 'insert') {
                        currentOp.nodes.unshift(newNode);
                    }
                    else {
                        currentOp = { type: 'insert', pos: nextPos, nodes: [newNode] };
                        ops.push(currentOp);
                    }
                    continue;
                }
                j--;
            }
            currentOp = null;
        }
        for (const op of ops) {
            if (op.type === 'insert' || op.type === 'move') {
                if (op.pos) {
                    _Fragment.append(...op.nodes);
                    parent.insertBefore(_Fragment, op.pos);
                }
                else {
                    parent.append(...op.nodes);
                }
            }
        }
    }
    function getLIS(arr) {
        const n = arr.length;
        const predecessors = new Int32Array(n);
        const tails = [];
        for (let i = 0; i < n; i++) {
            const num = arr[i];
            // Binary search in tails
            let lo = 0, hi = tails.length;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                if (arr[tails[mid]] < num)
                    lo = mid + 1;
                else
                    hi = mid;
            }
            // lo is the position to insert
            predecessors[i] = lo > 0 ? tails[lo - 1] : -1;
            if (lo === tails.length)
                tails.push(i);
            else
                tails[lo] = i;
        }
        // Reconstruct LIS indices
        const lis = [];
        let k = tails[tails.length - 1];
        for (let i = tails.length - 1; i >= 0; --i) {
            lis[i] = k;
            k = predecessors[k];
        }
        return lis;
    }

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
    function For(_props) {
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
