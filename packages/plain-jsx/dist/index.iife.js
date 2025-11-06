var PlainJSX = (function (exports, utilsJs) {
    'use strict';

    function For(_props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }

    const Fragment = 'Fragment';

    function Show(_props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }

    function With(_props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }

    function WithMany(_props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }

    const XMLNamespaces = {
        'svg': 'http://www.w3.org/2000/svg',
        'xhtml': 'http://www.w3.org/1999/xhtml',
    };
    function splitNamespace(tagNS) {
        const [ns, tag] = tagNS.split(':', 2);
        if (ns in XMLNamespaces) {
            return [XMLNamespaces[ns], tag];
        }
        else {
            throw new Error('Invalid namespace');
        }
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
    function findParentComponent(vNode) {
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
        return parent;
    }

    let _CurrentFunctionalComponent = null;
    function setCurrentFunctionalComponent(component) {
        _CurrentFunctionalComponent = component;
    }
    function defineRef(ref) {
        if (!_CurrentFunctionalComponent) {
            throw new Error('defineRef can only be called inside a functional component');
        }
        _CurrentFunctionalComponent.ref = ref;
    }
    function onMount(fn) {
        if (!_CurrentFunctionalComponent) {
            throw new Error('onMount can only be called inside a functional component');
        }
        if (_CurrentFunctionalComponent.onMountCallback) {
            throw new Error('onMount can only be called once');
        }
        _CurrentFunctionalComponent.onMountCallback = fn;
    }
    function onUnmount(fn) {
        if (!_CurrentFunctionalComponent) {
            throw new Error('onUnmount can only be called inside a functional component');
        }
        if (_CurrentFunctionalComponent.onUnmountCallback) {
            throw new Error('onUnmount can only be called once');
        }
        _CurrentFunctionalComponent.onUnmountCallback = fn;
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
        for (let i = 0; i < n; ++i) {
            const node = customNodes[i];
            // ignore reactive node placeholders
            if (node instanceof Comment) {
                continue;
            }
            mountVNode(node.__vNode);
            findParentComponent(node.__vNode)?.mount();
        }
    }
    function unmountNodes(nodes) {
        const customNodes = nodes;
        const n = customNodes.length;
        for (let i = 0; i < n; ++i) {
            const node = customNodes[i];
            // ignore reactive node placeholders
            if (node instanceof Comment) {
                continue;
            }
            unmountVNode(node.__vNode);
            findParentComponent(node.__vNode)?.unmount(false);
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
            parentComponent?.mount();
        }
        else if (vNode.type === 'text') {
            parentComponent?.mount();
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
            vNode.unmount();
        }
        // else if (vNode.type === 'text') {
        // }
        else if (vNode.type === 'builtin') {
            vNode.unmount();
        }
        else if (vNode.type === 'observable') {
            vNode.unmount();
        }
        else if (vNode.type === 'component') {
            vNode.unmount(true);
        }
    }

    function getLIS(arr) {
        const n = arr.length;
        const predecessors = new Int32Array(n);
        const tails = [];
        for (let i = 0; i < n; ++i) {
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

    let _callbacks = new Array();
    let _scheduled = false;
    function nextTick(callback) {
        _callbacks.push(callback);
        if (_scheduled)
            return;
        _scheduled = true;
        queueMicrotask(flushNextTickCallbacks);
    }
    function flushNextTickCallbacks() {
        const callbacks = _callbacks;
        _callbacks = [];
        _scheduled = false;
        const n = callbacks.length;
        for (let i = 0; i < n; ++i) {
            runAsync(callbacks[i]);
        }
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
    class DeferredUpdatesScheduler {
        static _items = [];
        static _scheduled = false;
        static schedule(item) {
            DeferredUpdatesScheduler._items.push(item);
            if (DeferredUpdatesScheduler._scheduled)
                return;
            DeferredUpdatesScheduler._scheduled = true;
            queueMicrotask(DeferredUpdatesScheduler.flush);
        }
        static flush() {
            const items = DeferredUpdatesScheduler._items;
            DeferredUpdatesScheduler._items = [];
            DeferredUpdatesScheduler._scheduled = false;
            const n = items.length;
            for (let i = 0; i < n; ++i) {
                items[i].flushUpdates();
            }
        }
    }

    /* helpers */
    function val(initialValue) {
        return new ValImpl(initialValue);
    }
    function ref() {
        return new ValImpl(null);
    }
    function computed(observables, compute) {
        return new Computed(observables, compute);
    }
    function subscribe(observables, observer) {
        return new MultiObservableSubscription(observables, observer);
    }
    /**
     * Base class for observables
     */
    class ObservableImpl {
        _subscriptions = null;
        _dependents = null;
        _nextDependantId = 0;
        _nextSubscriptionId = 0;
        _prevValue = null;
        _pendingUpdates = false;
        registerDependant(dependant) {
            this._dependents ??= new Map();
            const id = ++this._nextDependantId;
            this._dependents.set(id, new WeakRef(dependant));
            return {
                unsubscribe: () => {
                    this._dependents.delete(id);
                },
            };
        }
        notifyDependents() {
            if (!this._dependents)
                return;
            for (const [id, ref] of this._dependents.entries()) {
                const dependant = ref.deref();
                if (dependant) {
                    dependant.onDependencyUpdated();
                }
                else {
                    this._dependents.delete(id);
                }
            }
        }
        invalidate() {
            if (!this._subscriptions)
                return;
            if (this._pendingUpdates)
                return;
            this._pendingUpdates = true;
            this._prevValue = this.value;
            DeferredUpdatesScheduler.schedule(this);
        }
        flushUpdates() {
            if (!this._pendingUpdates)
                return;
            const prevValue = this._prevValue;
            const value = this.value;
            this._pendingUpdates = false;
            this._prevValue = null;
            if (value === prevValue) {
                return;
            }
            for (const observer of this._subscriptions.values()) {
                observer(value);
            }
        }
        subscribe(observer) {
            this._subscriptions ??= new Map();
            const id = ++this._nextSubscriptionId;
            this._subscriptions.set(id, observer);
            return {
                unsubscribe: () => {
                    this._subscriptions.delete(id);
                },
            };
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
            if (newValue === this._value)
                return;
            this.invalidate();
            this._value = newValue;
            this.notifyDependents();
        }
    }
    class ComputedSingle extends ObservableImpl {
        _compute;
        _observable;
        _value;
        _shouldReCompute;
        constructor(compute, observable) {
            super();
            this._compute = compute;
            this._observable = observable;
            this._value = this._compute(observable.value);
            this._shouldReCompute = false;
            observable.registerDependant(this);
        }
        onDependencyUpdated() {
            this.invalidate();
            this._shouldReCompute = true;
            this.notifyDependents();
        }
        get value() {
            if (this._shouldReCompute) {
                this._shouldReCompute = false;
                this._value = this._compute(this._observable.value);
            }
            return this._value;
        }
    }
    class Computed extends ObservableImpl {
        _compute;
        _observables;
        _value;
        _shouldReCompute;
        constructor(observables, compute) {
            super();
            this._compute = compute;
            this._observables = observables;
            this._value = this._compute(...observables.map(observable => observable.value));
            this._shouldReCompute = false;
            for (let i = 0; i < observables.length; ++i) {
                observables[i].registerDependant(this);
            }
        }
        onDependencyUpdated() {
            this.invalidate();
            this._shouldReCompute = true;
            this.notifyDependents();
        }
        get value() {
            if (this._shouldReCompute) {
                this._shouldReCompute = false;
                this._value = this._compute(...this._observables.map(observable => observable.value));
            }
            return this._value;
        }
    }
    class MultiObservableSubscription {
        _observables;
        _observer;
        _subscriptions;
        _pendingUpdates = false;
        constructor(observables, observer) {
            this._observer = observer;
            this._observables = observables;
            this._subscriptions = [];
            for (let i = 0; i < observables.length; ++i) {
                this._subscriptions.push(observables[i].registerDependant(this));
            }
        }
        onDependencyUpdated() {
            if (this._pendingUpdates)
                return;
            this._pendingUpdates = true;
            DeferredUpdatesScheduler.schedule(this);
        }
        flushUpdates() {
            if (!this._pendingUpdates)
                return;
            this._pendingUpdates = false;
            this._observer(...this._observables.map(observable => observable.value));
        }
        unsubscribe() {
            for (let i = 0; i < this._subscriptions.length; ++i) {
                this._subscriptions[i].unsubscribe();
            }
        }
    }

    const _Fragment = document.createDocumentFragment();
    const _HandledEvents = new Map();
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
    function updateChildren(parent, current, target) {
        const nCurrent = current.length;
        const nTarget = target.length;
        const newIndexMap = new Map();
        const newIndexToOldIndexMap = new Int32Array(nTarget).fill(-1);
        const nodeAfterEnd = current[nCurrent - 1].nextSibling; // `current` should never be empty, so this is safe
        let maxNewIndexSoFar = -1;
        let moved = false;
        for (let i = 0; i < nTarget; ++i) {
            newIndexMap.set(target[i], i);
        }
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
        const subscriptions = [];
        // handle class prop early so it doesn't overwrite class:* props
        if ('class' in props) {
            elem.className = props['class'];
        }
        for (const key in props) {
            if (key === 'class' || key === 'children') {
                continue;
            }
            const value = props[key];
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
            else if (key === 'style') {
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
                if (value instanceof ObservableImpl) {
                    elem.classList.toggle(className, value.value);
                    subscriptions.push(value.subscribe((value) => {
                        elem.classList.toggle(className, value);
                    }));
                }
                else {
                    elem.classList.toggle(className, value);
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
            else if (key in elem && !isReadonlyProp(elem, key)) {
                if (value instanceof ObservableImpl) {
                    elem[key] = value.value;
                    subscriptions.push(value.subscribe((value) => {
                        elem[key] = value;
                    }));
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
                else {
                    elem[key] = value;
                }
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
        return subscriptions.length === 0 ? null : subscriptions;
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

    function render(root, jsxNode) {
        const children = resolveReactiveNodes(renderJSX(jsxNode, null));
        root.append(...children);
        mountNodes(children);
    }
    function renderJSX(jsxNode, parent, domNodes = []) {
        const nodes = [jsxNode];
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
                    const vNode = new VNodeTextImpl(textNode, parent);
                    patchNode(textNode, vNode);
                    appendVNodeChild(parent, vNode);
                }
                domNodes.push(textNode);
            }
            else if (node instanceof ObservableImpl) {
                const reactiveNode = new ReactiveNode();
                const vNode = new VNodeObservableImpl(reactiveNode, node, parent);
                appendVNodeChild(parent, vNode);
                domNodes.push(reactiveNode);
            }
            else if ('type' in node) {
                if (typeof node.type === 'string') {
                    const hasNS = node.type.includes(':');
                    const domElement = hasNS
                        ? document.createElementNS(...splitNamespace(node.type))
                        : document.createElement(node.type);
                    const subscriptions = setProps(domElement, node.props);
                    if (parent?.type === 'element') {
                        // VNodes are only used to track children of components and reactive nodes
                        // if the parent is an element, we can append the dom element directly and add the subscriptions
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
                        const vNode = new VNodeElementImpl(domElement, parent);
                        vNode.subscriptions = subscriptions;
                        patchNode(domElement, vNode);
                        appendVNodeChild(parent, vNode);
                        const children = renderJSX(node.props.children, vNode);
                        domElement.append(...resolveReactiveNodes(children));
                    }
                    domNodes.push(domElement);
                }
                else {
                    const VNodeConstructor = BuiltinComponentMap.get(node.type);
                    if (VNodeConstructor) {
                        const reactiveNode = new ReactiveNode();
                        const vNode = new VNodeConstructor(reactiveNode, node.props, parent);
                        appendVNodeChild(parent, vNode);
                        domNodes.push(reactiveNode);
                    }
                    else {
                        const vNode = new VNodeFunctionalComponentImpl(node.props, parent);
                        setCurrentFunctionalComponent(vNode);
                        const jsxNode = node.type(node.props, { defineRef });
                        setCurrentFunctionalComponent(null);
                        appendVNodeChild(parent, vNode);
                        renderJSX(jsxNode, vNode, domNodes);
                    }
                }
            }
            else {
                throw new Error('Invalid JSX node');
            }
        }
        return domNodes;
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
    class VNodeTextImpl {
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
    class VNodeElementImpl {
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
        unmount() {
            if (this.subscriptions) {
                for (const subscription of this.subscriptions) {
                    subscription.unsubscribe();
                }
                this.subscriptions = null;
            }
        }
    }
    class VNodeFunctionalComponentImpl {
        type;
        ref = null;
        onMountCallback = null;
        onUnmountCallback = null;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        _refVal = null;
        _isMounted = false;
        _mountedChildrenCount = 0;
        _subscriptions = null;
        _pendingUpdates = false;
        constructor(props, parent) {
            this.type = 'component';
            this.parent = parent;
            if (props.ref instanceof ValImpl) {
                this._refVal = props.ref;
            }
        }
        mount() {
            this._mountedChildrenCount++;
            if (!this._pendingUpdates) {
                this._pendingUpdates = true;
                DeferredUpdatesScheduler.schedule(this);
            }
        }
        unmount(force) {
            if (force) {
                if (this._isMounted) {
                    this.unmountInternal();
                }
                this._mountedChildrenCount = 0;
                return;
            }
            this._mountedChildrenCount--;
            if (!this._pendingUpdates) {
                this._pendingUpdates = true;
                DeferredUpdatesScheduler.schedule(this);
            }
        }
        flushUpdates() {
            this._pendingUpdates = false;
            if (this._mountedChildrenCount > 0 && !this._isMounted) {
                this.mountInternal();
                findParentComponent(this)?.mount();
            }
            else if (this._mountedChildrenCount === 0 && this._isMounted) {
                this.unmountInternal();
                findParentComponent(this)?.unmount(false);
            }
        }
        mountInternal() {
            if (this._refVal) {
                this._refVal.value = this.ref;
            }
            if (this.onMountCallback) {
                const result = this.onMountCallback();
                this._subscriptions = result ?? null;
            }
            this._isMounted = true;
        }
        unmountInternal() {
            if (this._subscriptions) {
                const n = this._subscriptions.length;
                for (let i = 0; i < n; ++i) {
                    this._subscriptions[i].unsubscribe();
                }
                this._subscriptions = null;
            }
            this.onUnmountCallback?.();
            if (this._refVal) {
                this._refVal.value = null;
            }
            this._isMounted = false;
        }
    }
    class VNodeObservableImpl {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        _subscription = null;
        _renderedChildren = null;
        constructor(ref, value, parent) {
            this.type = 'observable';
            this.parent = parent;
            this.ref = ref;
            this.render(value.value);
            this._subscription = value.subscribe((value) => this.render(value));
        }
        render(jsxNode) {
            if ((typeof jsxNode === 'string' || typeof jsxNode === 'number')
                && this._renderedChildren?.length === 1
                && this._renderedChildren[0] instanceof Text) {
                // optimized update path for text nodes
                this._renderedChildren[0].textContent = jsxNode.toString();
            }
            else {
                this.firstChild = this.lastChild = null;
                this._renderedChildren = renderJSX(jsxNode, this);
                this.ref.update(this._renderedChildren);
            }
        }
        unmount() {
            if (this._subscription) {
                this._subscription.unsubscribe();
                this._subscription = null;
            }
        }
    }
    class VNodeFor {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        _children;
        _subscription = null;
        _frontBuffer = new Map();
        _backBuffer = new Map();
        constructor(ref, props, parent) {
            this.type = 'builtin';
            this.parent = parent;
            this.ref = ref;
            const forProps = props;
            this._children = forProps.children;
            const of = forProps.of;
            if (Array.isArray(of)) {
                this.render(of);
            }
            else if (of instanceof ObservableImpl) {
                this.render(of.value);
                this._subscription = of.subscribe((value) => this.render(value));
            }
            else {
                throw new Error("The 'of' prop on <For> is required and must be an array or an observable array.");
            }
        }
        render(items) {
            this.firstChild = this.lastChild = null;
            const n = items.length;
            for (let i = 0; i < n; ++i) {
                const value = items[i];
                let item = this._frontBuffer.get(value);
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
                    renderJSX(this._children({ item: value, index }), this);
                    let tail = this.lastChild;
                    if (head !== tail) {
                        head = head ? head.next : this.firstChild;
                    }
                    else {
                        head = tail = null;
                    }
                    item = { index, head, tail };
                }
                this._backBuffer.set(value, item);
            }
            if (this.lastChild) {
                this.lastChild.next = null;
            }
            this.ref.update(this.firstChild ? resolveRenderedVNodes(this.firstChild) : null);
            [this._frontBuffer, this._backBuffer] = [this._backBuffer, this._frontBuffer];
            this._backBuffer.clear();
        }
        unmount() {
            if (this._subscription) {
                this._subscription.unsubscribe();
                this._subscription = null;
            }
        }
    }
    class VNodeShow {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        _is;
        _keyed;
        _children;
        _fallback;
        _subscription = null;
        _shown = null;
        constructor(ref, props, parent) {
            this.type = 'builtin';
            this.parent = parent;
            this.ref = ref;
            const showProps = props;
            const when = showProps.when;
            this._is = showProps.is;
            this._keyed = showProps.keyed ?? false;
            this._children = showProps.children;
            this._fallback = showProps.fallback ?? null;
            if (when instanceof ObservableImpl) {
                this.render(when.value);
                this._subscription = when.subscribe((value) => this.render(value));
            }
            else {
                this.render(when);
            }
        }
        render(value) {
            let show;
            if (this._is === undefined) {
                show = Boolean(value);
            }
            else if (typeof this._is === 'function') {
                show = this._is(value);
            }
            else {
                show = value === this._is;
            }
            if (!this._keyed && this._shown === show) {
                return;
            }
            this._shown = show;
            this.firstChild = this.lastChild = null;
            const jsxNode = show ? this._children : this._fallback;
            if (jsxNode) {
                const children = renderJSX(typeof jsxNode === 'function' ? jsxNode() : jsxNode, this);
                this.ref.update(children);
            }
            else {
                this.ref.update(null);
            }
        }
        unmount() {
            if (this._subscription) {
                this._subscription.unsubscribe();
                this._subscription = null;
            }
        }
    }
    class VNodeWith {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        _children;
        _subscription = null;
        constructor(ref, props, parent) {
            this.type = 'builtin';
            this.parent = parent;
            this.ref = ref;
            const withProps = props;
            const value = withProps.value;
            this._children = withProps.children;
            if (value instanceof ObservableImpl) {
                this.render(value.value);
                this._subscription = value.subscribe((value) => this.render(value));
            }
            else {
                this.render(value);
            }
        }
        render(value) {
            this.firstChild = this.lastChild = null;
            const children = renderJSX(typeof this._children === 'function'
                ? this._children(value)
                : this._children, this);
            this.ref.update(children);
        }
        unmount() {
            if (this._subscription) {
                this._subscription.unsubscribe();
                this._subscription = null;
            }
        }
    }
    class VNodeWithMany {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        _values;
        _children;
        _subscriptions = null;
        _pendingUpdates = false;
        constructor(ref, props, parent) {
            this.type = 'builtin';
            this.parent = parent;
            this.ref = ref;
            const withManyProps = props;
            this._values = withManyProps.values;
            this._children = withManyProps.children;
            const args = [];
            for (let i = 0; i < this._values.length; ++i) {
                const value = this._values[i];
                if (value instanceof ObservableImpl) {
                    args.push(value.value);
                    this._subscriptions ??= [];
                    this._subscriptions.push(value.registerDependant(this));
                }
                else {
                    args.push(value);
                }
            }
            this.render(...args);
        }
        onDependencyUpdated() {
            if (this._pendingUpdates)
                return;
            this._pendingUpdates = true;
            DeferredUpdatesScheduler.schedule(this);
        }
        flushUpdates() {
            if (!this._pendingUpdates)
                return;
            this._pendingUpdates = false;
            this.render(...this._values.map(value => value instanceof ObservableImpl ? value.value : value));
        }
        render(...values) {
            this.firstChild = this.lastChild = null;
            const children = renderJSX(this._children(...values), this);
            this.ref.update(children);
        }
        unmount() {
            if (this._subscriptions) {
                for (let i = 0; i < this._subscriptions.length; ++i) {
                    this._subscriptions[i].unsubscribe();
                }
                this._subscriptions = null;
            }
        }
    }
    const BuiltinComponentMap = new Map([
        [For, VNodeFor],
        [Show, VNodeShow],
        [With, VNodeWith],
        [WithMany, VNodeWithMany],
    ]);

    exports.For = For;
    exports.Fragment = Fragment;
    exports.Show = Show;
    exports.With = With;
    exports.WithMany = WithMany;
    exports.computed = computed;
    exports.nextTick = nextTick;
    exports.onMount = onMount;
    exports.onUnmount = onUnmount;
    exports.ref = ref;
    exports.render = render;
    exports.subscribe = subscribe;
    exports.val = val;

    return exports;

})({}, Utils);
