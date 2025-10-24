var PlainJSX = (function (exports, utilsJs) {
    'use strict';

    function For(_props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }

    function Show(_props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }

    /**
     * The mounting and unmounting process is a bit complex and needs this bit of documentation
     *
     * We have 3 main groups of VNodes that represent:
     * 1. DOM Nodes ('text', 'element')
     * 2. Functional Components ('component')
     * 3. Reactive Nodes ('builtin', 'observable')
     *
     * Each of these 3 groups has a different mounting and unmounting logic.
     *
     * When is a VNode considered mounted?
     *  DOM Nodes: When they are a descendant of a connected DOM Node
     *  Functional Components: When they contain at least one DOM Node that is mounted
     *  Reactive Nodes: When they are a descendant of a connected DOM Node
     *
     *  Note: 'connected' here means the node is connected to the active DOM which is not the same as 'mounted'.
     *
     * Mounting logic:
     *  DOM Nodes: The call to mount will always mount the DOM Node and signal the closest functional component to be mounted.
     *  Functional Components: The call to mount does nothing, instead the functional component relies on mount signals from its children.
     *      Each child will give a mount signal and those are counted, when the count is greater than 0 the functional component gets mounted.
     *      Functional components will also signal parent functional components to be mounted.
     *  Reactive Nodes: The call to mount will always mount the reactive node but no signals are sent.
     *
     *  This can present an interesting situation where a functional component is not mounted, but it has reactive nodes that are mounted.
     *  Because a functional component is mounted when it has at least one DOM Node that is mounted, and a reactive node is mounted when it is a descendant of a connected DOM Node.
     *  If a mounted but empty reactive node is the only direct child of a functional component, then the functional component will not be mounted.
     *  This is a bit confusing, but it is valid.
     *
     * Unmounting logic:
     *  DOM Nodes: The call to unmount will always unmount the DOM Node and signal the closest functional component to be unmounted.
     *  Functional Components: The call to unmount does nothing, instead the functional component relies on unmount signals from its children.
     *      Each child will give an unmount signal that will decrements the count of mounted children, when the count is 0 the functional component gets unmounted.
     *      Functional components will also signal parent functional components to be unmounted.
     *  Reactive Nodes: The call to unmount will always unmount the reactive node but no signals are sent.
     */
    function mountNodes(nodes) {
        const customNodes = nodes;
        const n = customNodes.length;
        // handle reactive node placeholders
        if (n === 1 && customNodes[0] instanceof Comment) {
            return;
        }
        // this always gets called on children of the same parent, so it's safe to use the parent of the first node
        const parent = findParentComponent(customNodes[0].__vNode);
        if (parent) {
            for (let i = 0; i < n; i++) {
                mountVNode(customNodes[i].__vNode);
                parent.mountedChildrenCount++;
            }
            // we want to defer parent mount/unmount until all children have settled
            // we are not aware that there are other reactive nodes under the same parent that will mount/unmount in the same tick
            queueMicrotask(() => {
                if (parent.mountedChildrenCount > 0 && !parent.isMounted) {
                    parent.onMount();
                    signalParentComponent(parent, 'mount');
                }
            });
        }
        else {
            for (let i = 0; i < n; i++) {
                mountVNode(customNodes[i].__vNode);
            }
        }
    }
    function unmountNodes(nodes) {
        const customNodes = nodes;
        const n = customNodes.length;
        // handle reactive node placeholders
        if (n === 1 && customNodes[0] instanceof Comment) {
            return;
        }
        // this always gets called on children of the same parent, so it's safe to use the parent of the first node
        const parent = findParentComponent(customNodes[0].__vNode);
        if (parent) {
            for (let i = 0; i < n; i++) {
                unmountVNode(customNodes[i].__vNode);
                parent.mountedChildrenCount--;
            }
            // we want to defer parent mount/unmount until all children have settled
            // we are not aware that there are other reactive nodes under the same parent that will mount/unmount in the same tick
            queueMicrotask(() => {
                if (parent.mountedChildrenCount === 0 && parent.isMounted) {
                    parent.onUnmount();
                    signalParentComponent(parent, 'unmount');
                }
            });
        }
        else {
            for (let i = 0; i < n; i++) {
                unmountVNode(customNodes[i].__vNode);
            }
        }
    }
    function mountVNode(vNode, parentComponent = null) {
        let nextParentComponent;
        if (vNode.type === 'component') {
            nextParentComponent = vNode;
        }
        else if (vNode.type === 'element') {
            nextParentComponent = null;
        }
        else {
            nextParentComponent = parentComponent;
        }
        // mount children
        let child = vNode.firstChild;
        while (child) {
            mountVNode(child, nextParentComponent);
            child = child.next;
        }
        // mount self
        if (vNode.type === 'element') {
            if (parentComponent) {
                parentComponent.mountedChildrenCount++;
            }
        }
        else if (vNode.type === 'text') {
            if (parentComponent) {
                parentComponent.mountedChildrenCount++;
            }
        }
        // else if (vNode.type === 'builtin') {
        //     vNode.onMount();
        // }
        // else if (vNode.type === 'observable') {
        //     vNode.onMount();
        // }
        else if (vNode.type === 'component') {
            if (vNode.mountedChildrenCount > 0 && !vNode.isMounted) {
                vNode.onMount();
                if (parentComponent) {
                    parentComponent.mountedChildrenCount++;
                }
            }
        }
    }
    function unmountVNode(vNode) {
        // unmount children
        let child = vNode.firstChild;
        while (child) {
            unmountVNode(child);
            child = child.next;
        }
        // unmount self
        if (vNode.type === 'element') {
            vNode.onUnmount();
        }
        // else if (vNode.type === 'text') {
        // }
        else if (vNode.type === 'builtin') {
            vNode.onUnmount();
        }
        else if (vNode.type === 'observable') {
            vNode.onUnmount();
        }
        else if (vNode.type === 'component') {
            vNode.onUnmount();
        }
    }
    function signalParentComponent(vNode, signal) {
        let parent = vNode.parent;
        while (parent) {
            if (parent.type === 'component') {
                break;
            }
            else if (parent.type === 'element') {
                return;
            }
            parent = parent.parent;
        }
        if (!parent)
            return;
        if (signal === 'mount') {
            parent.mountedChildrenCount++;
            queueMicrotask(() => {
                if (parent.mountedChildrenCount > 0 && !parent.isMounted) {
                    parent.onMount();
                    signalParentComponent(parent, 'mount');
                }
            });
        }
        else if (signal === 'unmount') {
            parent.mountedChildrenCount--;
            queueMicrotask(() => {
                if (parent.mountedChildrenCount === 0 && parent.isMounted) {
                    parent.onUnmount();
                    signalParentComponent(parent, 'unmount');
                }
            });
        }
    }
    function findParentComponent(vNode) {
        let parent = vNode.parent;
        while (parent) {
            if (parent.type === 'component') {
                return parent;
            }
            else if (parent.type === 'element') {
                return null;
            }
            parent = parent.parent;
        }
        return null;
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

    /* helpers */
    function val(initialValue) {
        return new ValImpl(initialValue);
    }
    function computed(observables, compute) {
        return new Computed(observables, compute);
    }
    function ref() {
        return new ValImpl(null);
    }
    class NotificationScheduler {
        static _notificationSources = [];
        static _scheduled = false;
        static schedule(notificationSource) {
            this._notificationSources.push(notificationSource);
            if (!this._scheduled) {
                this._scheduled = true;
                queueMicrotask(this.flush);
            }
        }
        static flush() {
            const n = NotificationScheduler._notificationSources.length;
            for (let i = 0; i < n; ++i) {
                NotificationScheduler._notificationSources[i].notify();
            }
            NotificationScheduler._notificationSources = [];
            NotificationScheduler._scheduled = false;
        }
    }
    class SubscriptionImpl {
        cb;
        instance;
        id;
        observableImpl;
        constructor(cb, instance, observableImpl) {
            this.cb = cb;
            this.instance = instance;
            this.id = observableImpl.addSubscription(this);
            this.observableImpl = observableImpl;
        }
        unsubscribe() {
            if (this.observableImpl) {
                this.observableImpl.removeSubscription(this.id);
                this.observableImpl = null;
            }
        }
    }
    /**
     * Base class for observables
     */
    class ObservableImpl {
        subscriptions = new Map();
        dependents = [];
        _nextSubscriptionId = 0;
        _prevValue = null;
        _pendingNotify = false;
        registerDependant(dependant) {
            this.dependents.push(new WeakRef(dependant));
        }
        notifyDependents() {
            const n = this.dependents.length;
            let write = 0;
            for (let i = 0; i < n; ++i) {
                const dependant = this.dependents[i].deref();
                if (dependant) {
                    dependant.onDependencyUpdated();
                    this.dependents[write++] = this.dependents[i];
                }
            }
            this.dependents.length = write;
        }
        queueNotify() {
            if (this._pendingNotify) {
                return;
            }
            this._pendingNotify = true;
            this._prevValue = this.value;
            NotificationScheduler.schedule(this);
        }
        notify() {
            if (!this._pendingNotify) {
                return;
            }
            const prevValue = this._prevValue;
            const value = this.value;
            this._pendingNotify = false;
            this._prevValue = null;
            if (value === prevValue) {
                return;
            }
            for (const subscription of this.subscriptions.values()) {
                subscription.cb.call(subscription.instance, value);
            }
        }
        addSubscription(subscription) {
            const id = ++this._nextSubscriptionId;
            this.subscriptions.set(id, subscription);
            return id;
        }
        removeSubscription(id) {
            this.subscriptions.delete(id);
        }
        subscribe(observer, instance) {
            return new SubscriptionImpl(observer, instance ?? null, this);
        }
        computed(compute) {
            return new ComputedSingle(compute, this);
        }
    }
    /**
     * Simple observable value implementation
     */
    class ValImpl extends ObservableImpl {
        _value;
        constructor(initialValue) {
            super();
            this._value = initialValue;
        }
        get value() {
            return this._value;
        }
        set value(newValue) {
            this.queueNotify();
            this._value = newValue;
            this.notifyDependents();
        }
    }
    class ComputedSingle extends ObservableImpl {
        compute;
        observable;
        _value;
        _shouldReCompute;
        constructor(compute, observable) {
            super();
            this.compute = compute;
            this.observable = observable;
            this._value = this.compute(observable.value);
            this._shouldReCompute = false;
            observable.registerDependant(this);
        }
        onDependencyUpdated() {
            this.queueNotify();
            this._shouldReCompute = true;
            this.notifyDependents();
        }
        get value() {
            if (this._shouldReCompute) {
                this._shouldReCompute = false;
                this._value = this.compute(this.observable.value);
            }
            return this._value;
        }
    }
    class Computed extends ObservableImpl {
        compute;
        observables;
        _value;
        _shouldReCompute;
        constructor(observables, compute) {
            super();
            this.compute = compute;
            this.observables = observables;
            this._value = this.compute(...observables.map(observable => observable.value));
            this._shouldReCompute = false;
            for (let i = 0; i < observables.length; ++i) {
                observables[i].registerDependant(this);
            }
        }
        onDependencyUpdated() {
            this.queueNotify();
            this._shouldReCompute = true;
            this.notifyDependents();
        }
        get value() {
            if (this._shouldReCompute) {
                this._shouldReCompute = false;
                this._value = this.compute(...this.observables.map(observable => observable.value));
            }
            return this._value;
        }
    }

    const XMLNamespaces = {
        'svg': 'http://www.w3.org/2000/svg',
        'xhtml': 'http://www.w3.org/1999/xhtml',
    };
    function splitNamespace(tagNS) {
        const [ns, tag] = tagNS.split(':', 2);
        if (!utilsJs.hasKey(XMLNamespaces, ns)) {
            throw new Error('Invalid namespace');
        }
        return [XMLNamespaces[ns], tag];
    }
    function isReadonlyProp(obj, key) {
        let currentObj = obj;
        while (currentObj !== null) {
            const desc = Object.getOwnPropertyDescriptor(currentObj, key);
            if (desc) {
                return desc.writable === false || desc.set === undefined;
            }
            currentObj = Object.getPrototypeOf(currentObj);
        }
        return true;
    }

    const _Fragment = document.createDocumentFragment();
    const _HandledEvents = new Map();
    const _CachedSetters = new Map();
    const InputTwoWayProps = {
        value: null,
        valueAsNumber: null,
        valueAsDate: null,
        checked: null,
        files: null,
    };
    const SelectTwoWayProps = {
        value: null,
        selectedIndex: null,
    };
    function reconcileChildren(parent, current, target) {
        const newIndexMap = new Map();
        const nTarget = target.length;
        const nCurrent = current.length;
        for (let i = 0; i < nTarget; ++i) {
            newIndexMap.set(target[i], i);
        }
        const newIndexToOldIndexMap = new Int32Array(nTarget).fill(-1);
        const nodeAfterEnd = current[nCurrent - 1].nextSibling; // `current` should never be empty, so this is safe
        let maxNewIndexSoFar = -1;
        let moved = false;
        const toRemove = new Array();
        for (let i = 0; i < nCurrent; ++i) {
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
        if (toRemove.length) {
            unmountNodes(toRemove);
            _Fragment.append(...toRemove);
            _Fragment.textContent = null;
        }
        // compute longest increasing subsequence
        const lis = moved ? getLIS(newIndexToOldIndexMap) : [];
        const ops = [];
        let currentOp = null;
        let j = lis.length - 1;
        for (let i = nTarget - 1; i >= 0; --i) {
            const newNode = target[i];
            const nextPos = target.at(i + 1) ?? nodeAfterEnd;
            if (newIndexToOldIndexMap[i] === -1) {
                if (currentOp?.type === 'insert') {
                    currentOp.nodes.push(newNode);
                }
                else {
                    currentOp = { type: 'insert', pos: nextPos, nodes: [newNode] };
                    ops.push(currentOp);
                }
                continue;
            }
            else if (moved) {
                if (j < 0 || i !== lis[j]) {
                    if (currentOp?.type === 'move') {
                        currentOp.nodes.push(newNode);
                    }
                    else {
                        currentOp = { type: 'move', pos: nextPos, nodes: [newNode] };
                        ops.push(currentOp);
                    }
                    continue;
                }
                j--;
            }
            currentOp = null;
        }
        for (const op of ops) {
            // both operations are handled the same way
            if (op.pos) {
                _Fragment.append(...op.nodes.reverse());
                parent.insertBefore(_Fragment, op.pos);
            }
            else {
                parent.append(...op.nodes.reverse());
            }
            if (op.type === 'insert') {
                mountNodes(op.nodes);
            }
        }
    }
    function patchNode(node, vNode) {
        node.__vNode = vNode;
    }
    function setProps(elem, props) {
        // handle class prop early so it doesn't overwrite class:* props
        if ('class' in props) {
            elem.className = props['class'];
        }
        for (const key in props) {
            if (key === 'ref' || key === 'class' || key === 'children') {
                continue;
            }
            const value = props[key];
            if (key === 'style') {
                if (utilsJs.isObject(value)) {
                    Object.assign(elem.style, value);
                }
                else if (typeof value === 'string') {
                    elem.setAttribute('style', value);
                }
                else {
                    throw new Error("Invalid value type for 'style' prop.");
                }
            }
            else if (key === 'dataset') {
                if (!utilsJs.isObject(value)) {
                    throw new Error('Dataset value must be an object');
                }
                Object.assign(elem.dataset, value);
            }
            else if (key.startsWith('class:')) {
                const className = key.slice(6);
                const active = (value instanceof ObservableImpl ? value.value : value);
                if (active) {
                    elem.classList.add(className);
                }
            }
            else if (key.startsWith('on:')) {
                const event = key.slice(3);
                let eventKey = _HandledEvents.get(event);
                if (!eventKey) {
                    eventKey = Symbol(event);
                    _HandledEvents.set(event, eventKey);
                    document.addEventListener(event, globalEventHandler);
                }
                elem[eventKey] = value;
            }
            else if (utilsJs.hasKey(elem, key) && !isReadonlyProp(elem, key)) {
                elem[key] = value instanceof ObservableImpl
                    ? value.value
                    : value;
            }
            else {
                if (key.includes(':')) {
                    elem.setAttributeNS(splitNamespace(key)[0], key, value);
                }
                else {
                    elem.setAttribute(key, value);
                }
            }
        }
    }
    function observeProps(elem, props) {
        const subscriptions = [];
        for (const key in props) {
            if (key === 'children') {
                continue;
            }
            const value = props[key];
            if (value instanceof ObservableImpl === false) {
                continue;
            }
            if (key === 'ref') {
                if (value instanceof ValImpl) {
                    value.value = elem;
                    subscriptions.push({
                        unsubscribe: () => {
                            value.value = null;
                        },
                    });
                }
            }
            else if (key.startsWith('class:')) {
                let setter = _CachedSetters.get(key);
                if (!setter) {
                    const className = key.slice(6);
                    setter = createClassSetter(className);
                    _CachedSetters.set(key, setter);
                }
                subscriptions.push(value.subscribe(setter, elem));
            }
            else if (utilsJs.hasKey(elem, key)) {
                let setter = _CachedSetters.get(key);
                if (!setter) {
                    setter = createPropSetter(key);
                    _CachedSetters.set(key, setter);
                }
                subscriptions.push(value.subscribe(setter, elem));
                // two way updates for input element
                if ((elem instanceof HTMLInputElement && key in InputTwoWayProps)
                    || (elem instanceof HTMLSelectElement && key in SelectTwoWayProps)) {
                    const handler = value instanceof ValImpl
                        ? (e) => {
                            value.value = e.target[key];
                        }
                        : (e) => {
                            e.preventDefault();
                            e.target[key] = value.value;
                        };
                    elem.addEventListener('change', handler);
                    subscriptions.push({
                        unsubscribe: () => elem.removeEventListener('change', handler),
                    });
                }
            }
        }
        return subscriptions.length === 0 ? null : subscriptions;
    }
    function createPropSetter(key) {
        return function (value) {
            this[key] = value;
        };
    }
    function createClassSetter(className) {
        return function (value) {
            this.classList.toggle(className, value);
        };
    }
    function globalEventHandler(evt) {
        const key = _HandledEvents.get(evt.type);
        let node = evt.target;
        while (node) {
            const handler = node[key];
            if (handler) {
                return handler.call(node, evt);
            }
            node = node.parentNode;
        }
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
                reconcileChildren(parent, children, newChildren);
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

    let callbacks = new Array();
    let queued = false;
    function runNextTickCallbacks() {
        const n = callbacks.length;
        queued = false;
        for (let i = 0; i < n; i++) {
            runAsync(callbacks[i]);
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
    function runAsync(action) {
        try {
            const result = action();
            if (result instanceof Promise) {
                result.catch(err => console.error(err));
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    const Fragment = 'Fragment';
    // export let initialRenderDone = false;
    function render(root, jsxNode) {
        const children = resolveReactiveNodes(renderJSX(jsxNode, null));
        root.append(...children);
        mountNodes(children);
        // initialRenderDone = true;
    }
    function appendVNodeChild(parent, vNode) {
        if (!parent)
            return;
        if (parent.lastChild) {
            parent.lastChild.next = vNode;
            parent.lastChild = vNode;
        }
        else {
            parent.firstChild = parent.lastChild = vNode;
        }
    }
    function renderJSX(jsxNode, parent, domNodes = []) {
        const nodes = [];
        nodes.push(jsxNode);
        while (nodes.length > 0) {
            const node = nodes.shift();
            // skip null, undefined and boolean
            if (node == null || typeof node === 'boolean') {
                continue;
            }
            // flatten arrays
            if (Array.isArray(node)) {
                nodes.unshift(...node);
                continue;
            }
            // flatten fragments
            if (typeof node === 'object' && 'type' in node && node.type === Fragment) {
                if (Array.isArray(node.props.children)) {
                    nodes.unshift(...node.props.children);
                }
                else {
                    nodes.unshift(node.props.children);
                }
                continue;
            }
            if (typeof node === 'string' || typeof node === 'number') {
                const textNode = document.createTextNode(String(node));
                if (parent?.type !== 'element') {
                    const vNode = new _VNodeText(textNode, parent);
                    patchNode(textNode, vNode);
                    appendVNodeChild(parent, vNode);
                }
                domNodes.push(textNode);
            }
            else if (node instanceof ObservableImpl) {
                const reactiveNode = new ReactiveNode();
                const vNode = new _VNodeObservable(reactiveNode, node, parent);
                appendVNodeChild(parent, vNode);
                domNodes.push(reactiveNode);
            }
            else if ('type' in node) {
                if (typeof node.type === 'string') {
                    const hasNS = node.type.includes(':');
                    const domElement = hasNS
                        ? document.createElementNS(...splitNamespace(node.type))
                        : document.createElement(node.type);
                    setProps(domElement, node.props);
                    if (parent?.type === 'element') {
                        const subscriptions = observeProps(domElement, node.props);
                        if (subscriptions) {
                            if (parent.subscriptions) {
                                parent.subscriptions.push(...subscriptions);
                            }
                            else {
                                parent.subscriptions = subscriptions;
                            }
                        }
                        const children = renderJSX(node.props.children, parent);
                        domElement.append(...resolveReactiveNodes(children));
                    }
                    else {
                        const vNode = new _VNodeElement(domElement, parent);
                        vNode.subscriptions = observeProps(domElement, node.props);
                        patchNode(domElement, vNode);
                        appendVNodeChild(parent, vNode);
                        const children = renderJSX(node.props.children, vNode);
                        domElement.append(...resolveReactiveNodes(children));
                    }
                    domNodes.push(domElement);
                }
                else if (node.type === For) {
                    const reactiveNode = new ReactiveNode();
                    const vNode = new _VNodeFor(reactiveNode, node.props, parent);
                    appendVNodeChild(parent, vNode);
                    domNodes.push(reactiveNode);
                }
                else if (node.type === Show) {
                    const reactiveNode = new ReactiveNode();
                    const vNode = new _VNodeShow(reactiveNode, node.props, parent);
                    appendVNodeChild(parent, vNode);
                    domNodes.push(reactiveNode);
                }
                else if (typeof node.type === 'function') {
                    const vNode = new _VNodeFunctionalComponent(node.props, parent);
                    const defineRef = (ref) => {
                        vNode.ref = ref;
                    };
                    const onMount = (fn) => {
                        vNode.onMountCallback = fn;
                    };
                    const onUnmount = (fn) => {
                        vNode.onUnmountCallback = fn;
                    };
                    const jsxNode = node.type(node.props, { defineRef, onMount, onUnmount });
                    appendVNodeChild(parent, vNode);
                    renderJSX(jsxNode, vNode, domNodes);
                }
                else {
                    throw new Error('Invalid JSX node');
                }
            }
            else {
                throw new Error('Invalid JSX node');
            }
        }
        return domNodes;
    }
    function resolveRenderedVNodes(vNodes, childNodes = []) {
        let vNode = vNodes;
        while (vNode) {
            if (vNode.type === 'text') {
                childNodes.push(vNode.ref);
            }
            else if (vNode.type === 'observable') {
                childNodes.push(vNode.ref);
            }
            else if (vNode.type === 'element') {
                childNodes.push(vNode.ref);
            }
            else if (vNode.type === 'component' && vNode.firstChild) {
                resolveRenderedVNodes(vNode.firstChild, childNodes);
            }
            else if (vNode.type === 'builtin') {
                childNodes.push(vNode.ref);
            }
            vNode = vNode.next;
        }
        return childNodes;
    }
    class _VNodeText {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        constructor(ref, parent) {
            this.type = 'text';
            this.parent = parent;
            this.ref = ref;
        }
    }
    class _VNodeFunctionalComponent {
        type;
        ref = null;
        isMounted = false;
        mountedChildrenCount = 0;
        onMountCallback = null;
        onUnmountCallback = null;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        propsRef = null;
        constructor(props, parent) {
            this.type = 'component';
            this.parent = parent;
            if (props.ref instanceof ValImpl) {
                this.propsRef = props.ref;
            }
        }
        onMount() {
            if (this.propsRef) {
                this.propsRef.value = this.ref;
            }
            if (this.onMountCallback) {
                runAsync(this.onMountCallback);
            }
            this.isMounted = true;
        }
        onUnmount() {
            if (this.onUnmountCallback) {
                runAsync(this.onUnmountCallback);
            }
            if (this.propsRef) {
                this.propsRef.value = null;
            }
            this.mountedChildrenCount = 0; // for when forcing an unmount
            this.isMounted = false;
        }
    }
    class _VNodeElement {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        subscriptions = null;
        constructor(ref, parent) {
            this.type = 'element';
            this.parent = parent;
            this.ref = ref;
        }
        onUnmount() {
            if (this.subscriptions) {
                for (const subscription of this.subscriptions) {
                    subscription.unsubscribe();
                }
                this.subscriptions = null;
            }
        }
    }
    class _VNodeObservable {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        subscription = null;
        _renderedChildren = null;
        constructor(ref, value, parent) {
            this.type = 'observable';
            this.parent = parent;
            this.ref = ref;
            this.render(value.value);
            this.subscription = value.subscribe(this.render.bind(this));
        }
        render(jsxNode) {
            if ((typeof jsxNode === 'string' || typeof jsxNode === 'number')
                && this._renderedChildren?.length === 1
                && this._renderedChildren[0] instanceof Node
                && this._renderedChildren[0].nodeType === Node.TEXT_NODE) {
                // optimized update path for text nodes
                this._renderedChildren[0].textContent = jsxNode.toString();
            }
            else {
                this.firstChild = this.lastChild = null;
                this._renderedChildren = renderJSX(jsxNode, this);
                this.ref.update(this._renderedChildren);
            }
        }
        onUnmount() {
            if (this.subscription) {
                this.subscription.unsubscribe();
                this.subscription = null;
            }
        }
    }
    class _VNodeFor {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        subscription = null;
        frontBuffer = new Map();
        backBuffer = new Map();
        mapFn;
        constructor(ref, props, parent) {
            this.type = 'builtin';
            this.parent = parent;
            this.ref = ref;
            const typedProps = props;
            if (typeof typedProps.children !== 'function') {
                throw new Error('The <For> component must have exactly one child — a function that maps each item.');
            }
            this.mapFn = typedProps.children;
            if (Array.isArray(typedProps.of)) {
                this.render(typedProps.of);
            }
            else if (typedProps.of instanceof ObservableImpl) {
                this.render(typedProps.of.value);
                this.subscription = typedProps.of.subscribe(this.render.bind(this));
            }
            else {
                throw new Error("The 'of' prop on <For> is required and must be an array or an observable array.");
            }
        }
        render(items) {
            this.firstChild = this.lastChild = null;
            const n = items.length;
            for (let i = 0; i < n; i++) {
                const value = items[i];
                let item = this.frontBuffer.get(value);
                if (item) {
                    item.index.value = i;
                    this.firstChild ??= item.head;
                    if (item.tail) {
                        if (this.lastChild) {
                            this.lastChild.next = item.head;
                        }
                        this.lastChild = item.tail;
                    }
                }
                else {
                    const index = val(i);
                    let head = this.lastChild;
                    renderJSX(this.mapFn({ item: value, index }), this);
                    let tail = this.lastChild;
                    if (head !== tail) {
                        head = head ? head.next : this.firstChild;
                    }
                    else {
                        head = tail = null;
                    }
                    item = { index, head, tail };
                }
                this.backBuffer.set(value, item);
            }
            if (this.lastChild) {
                this.lastChild.next = null;
            }
            this.ref.update(this.firstChild ? resolveRenderedVNodes(this.firstChild) : null);
            [this.frontBuffer, this.backBuffer] = [this.backBuffer, this.frontBuffer];
            this.backBuffer.clear();
        }
        onUnmount() {
            if (this.subscription) {
                this.subscription.unsubscribe();
                this.subscription = null;
            }
        }
    }
    class _VNodeShow {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        childrenOrFn;
        subscription = null;
        constructor(ref, props, parent) {
            this.type = 'builtin';
            this.parent = parent;
            this.ref = ref;
            const when = props.when;
            if (typeof when === 'boolean') {
                this.render(when);
            }
            else if (when instanceof ObservableImpl) {
                this.render(when.value);
                this.subscription = when.subscribe(this.render.bind(this));
            }
            else {
                throw new Error("The 'when' prop on <Show> is required and must be a boolean or an observable boolean.");
            }
            this.childrenOrFn = props.children;
        }
        render(value) {
            if (value) {
                this.firstChild = this.lastChild = null;
                const children = renderJSX(typeof this.childrenOrFn === 'function'
                    ? this.childrenOrFn()
                    : this.childrenOrFn, this);
                this.ref.update(children);
            }
            else {
                this.firstChild = this.lastChild = null;
                this.ref.update(null);
            }
        }
        onUnmount() {
            if (this.subscription) {
                this.subscription.unsubscribe();
                this.subscription = null;
            }
        }
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

})({}, Utils);
