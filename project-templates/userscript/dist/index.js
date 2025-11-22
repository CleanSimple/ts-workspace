// ==UserScript==
// @name         Sample Project
// @description  Sample Project
// @version      1.0.0
// @match        https://www.google.com.eg/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com.eg
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    const Fragment = 'Fragment';

    function jsx(type, props) {
        return { type, props };
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

    /**
     * Base class for observables
     * Handles subscriptions and dispatching updates
     */
    class ObservableBase {
        _observers = null;
        _dependents = null;
        _nextDependantId = 0;
        _nextSubscriptionId = 0;
        _prevValue = null;
        _pendingUpdates = false;
        registerDependent(dependant) {
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
        scheduleUpdate() {
            if (!this._observers)
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
            for (const observer of this._observers.values()) {
                try {
                    const result = observer(value);
                    if (result instanceof Promise) {
                        result.catch(err => console.error(err));
                    }
                }
                catch (err) {
                    console.error(err);
                }
            }
        }
        subscribe(observer) {
            this._observers ??= new Map();
            const id = ++this._nextSubscriptionId;
            this._observers.set(id, observer);
            return {
                unsubscribe: () => {
                    this._observers.delete(id);
                },
            };
        }
    }

    class MultiObservableSubscription {
        _observables;
        _observer;
        _subscriptions;
        _pendingUpdates = false;
        constructor(observables, observer) {
            this._observables = observables;
            this._observer = observer;
            this._subscriptions = [];
            for (let i = 0; i < observables.length; ++i) {
                this._subscriptions.push(observables[i].registerDependent(this));
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

    /**
     * Simple observable value implementation
     */
    class ValImpl extends ObservableBase {
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
            this.scheduleUpdate();
            this._value = newValue;
            this.notifyDependents();
        }
    }

    function val(initialValue) {
        return new ValImpl(initialValue);
    }
    function subscribe(observables, observer) {
        return new MultiObservableSubscription(observables, observer);
    }
    function isObservable(value) {
        return value instanceof ObservableBase;
    }
    function isVal(value) {
        return value instanceof ValImpl;
    }

    function For(_props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }

    function Show(_props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }

    function With(_props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }

    function WithMany(_props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
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

    const RefValue = Symbol('RefValue');
    function ref() {
        return new RefImpl();
    }
    class RefImpl {
        [RefValue] = null;
        get current() {
            return this[RefValue];
        }
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
    function isObject(value) {
        return typeof value === 'object'
            && value !== null
            && Object.getPrototypeOf(value) === Object.prototype;
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
        }
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
                if (value instanceof RefImpl) {
                    value[RefValue] = elem;
                    subscriptions.push({
                        unsubscribe: () => {
                            value[RefValue] = null;
                        },
                    });
                }
            }
            else if (key === 'style') {
                if (isObject(value)) {
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
                if (!isObject(value)) {
                    throw new Error('Dataset value must be an object');
                }
                Object.assign(elem.dataset, value);
            }
            else if (key.startsWith('class:')) {
                const className = key.slice(6);
                if (isObservable(value)) {
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
                if (isObservable(value)) {
                    elem[key] = value.value;
                    subscriptions.push(value.subscribe((value) => {
                        elem[key] = value;
                    }));
                    // two way updates for input element
                    if ((elem instanceof HTMLInputElement && key in InputTwoWayProps)
                        || (elem instanceof HTMLSelectElement && key in SelectTwoWayProps)) {
                        const handler = isVal(value)
                            ? (e) => {
                                value.value = e.target[key];
                            }
                            : (e) => {
                                e.preventDefault();
                                e.target[key] = value.value;
                            };
                        elem.addEventListener('input', handler);
                        subscriptions.push({
                            unsubscribe: () => elem.removeEventListener('input', handler),
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

    let _LifecycleContext = null;
    function setLifecycleContext(lifecycleContext) {
        _LifecycleContext = lifecycleContext;
    }
    function defineRef(ref) {
        if (!_LifecycleContext) {
            throw new Error('defineRef can only be called inside a functional component');
        }
        _LifecycleContext.ref = ref;
    }
    function cleanupVNode(vNode) {
        let child = vNode.firstChild;
        while (child) {
            cleanupVNode(child);
            child = child.next;
        }
        vNode.cleanup();
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

    let _callbacks = [];
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

    const _lifecycleContext = {
        ref: null,
        subscriptions: null,
        onMountCallback: null,
        onCleanupCallback: null,
    };
    const _renderedRoots = [];
    function render(root, jsxNode) {
        const vNode = new VNodeRoot();
        const children = renderJSX(jsxNode, vNode);
        _renderedRoots.push(vNode);
        root.append(...resolveReactiveNodes(children));
        return {
            dispose: () => {
                const index = _renderedRoots.indexOf(vNode);
                if (index === -1)
                    return;
                cleanupVNode(vNode);
                for (const child of resolveReactiveNodes(children)) {
                    root.removeChild(child);
                }
                _renderedRoots.splice(index, 1);
            },
        };
    }
    function renderJSX(jsxNode, parent, domNodes = []) {
        const nodes = [jsxNode];
        while (nodes.length > 0) {
            const node = nodes.shift();
            // skip null, undefined and boolean
            if (node == null || typeof node === 'boolean') {
                continue;
            }
            // render strings
            else if (typeof node === 'string' || typeof node === 'number') {
                const textNode = document.createTextNode(String(node));
                domNodes.push(textNode);
            }
            // render observables
            else if (isObservable(node)) {
                const reactiveNode = new ReactiveNode();
                const vNode = new VNodeObservable(reactiveNode, node);
                appendVNodeChild(parent, vNode);
                vNode.render();
                domNodes.push(reactiveNode);
            }
            // flatten arrays
            else if (Array.isArray(node)) {
                nodes.unshift(...node);
            }
            else if ('type' in node) {
                // flatten fragments
                if (node.type === Fragment) {
                    if (Array.isArray(node.props.children)) {
                        nodes.unshift(...node.props.children);
                    }
                    else {
                        nodes.unshift(node.props.children);
                    }
                }
                // render DOM elements
                else if (typeof node.type === 'string') {
                    const hasNS = node.type.includes(':');
                    const domElement = hasNS
                        ? document.createElementNS(...splitNamespace(node.type))
                        : document.createElement(node.type);
                    const subscriptions = setProps(domElement, node.props);
                    if (subscriptions) {
                        parent.registerSubscriptions(subscriptions);
                    }
                    const children = renderJSX(node.props.children, parent);
                    domElement.append(...resolveReactiveNodes(children));
                    domNodes.push(domElement);
                }
                // render components
                else {
                    const VNodeConstructor = BuiltinComponentMap.get(node.type);
                    // render built-in components
                    if (VNodeConstructor) {
                        const reactiveNode = new ReactiveNode();
                        const vNode = new VNodeConstructor(reactiveNode, node.props);
                        appendVNodeChild(parent, vNode);
                        vNode.render();
                        domNodes.push(reactiveNode);
                    }
                    // render functional components
                    else {
                        setLifecycleContext(_lifecycleContext);
                        const jsxNode = node.type(node.props, { defineRef });
                        setLifecycleContext(null);
                        const vNode = new VNodeFunctionalComponent(node.props, _lifecycleContext);
                        appendVNodeChild(parent, vNode);
                        // reset the lifecycle context
                        _lifecycleContext.ref = null;
                        _lifecycleContext.subscriptions = null;
                        _lifecycleContext.onMountCallback = null;
                        _lifecycleContext.onCleanupCallback = null;
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
        if (parent.lastChild) {
            parent.lastChild.next = vNode;
            parent.lastChild = vNode;
        }
        else {
            parent.firstChild = parent.lastChild = vNode;
        }
    }
    class VNodeBase {
        firstChild = null;
        lastChild = null;
        next = null;
    }
    class VNodeRoot extends VNodeBase {
        _subscriptions = null;
        registerSubscriptions(subscriptions) {
            this._subscriptions ??= [];
            this._subscriptions.push(...subscriptions);
        }
        cleanup() {
            if (this._subscriptions) {
                const n = this._subscriptions.length;
                for (let i = 0; i < n; ++i) {
                    this._subscriptions[i].unsubscribe();
                }
                this._subscriptions = null;
            }
        }
    }
    class VNodeBuiltinComponent extends VNodeBase {
        reactiveNode;
        _subscription = null;
        constructor(reactiveNode) {
            super();
            this.reactiveNode = reactiveNode;
        }
        setSubscription(subscription) {
            this._subscription = subscription;
        }
        cleanup() {
            this._subscription?.unsubscribe();
        }
    }
    class VNodeFunctionalComponent extends VNodeRoot {
        _ref;
        _refProp = null;
        _onCleanupCallback;
        constructor(props, lifecycleContext) {
            super();
            this._ref = lifecycleContext.ref;
            this._onCleanupCallback = lifecycleContext.onCleanupCallback;
            if (lifecycleContext.subscriptions) {
                this.registerSubscriptions(lifecycleContext.subscriptions);
            }
            if (props.ref instanceof RefImpl) {
                this._refProp = props.ref;
                this._refProp[RefValue] = this._ref;
            }
            if (lifecycleContext.onMountCallback) {
                nextTick(lifecycleContext.onMountCallback);
            }
        }
        cleanup() {
            super.cleanup();
            this._onCleanupCallback?.();
            if (this._refProp) {
                this._refProp[RefValue] = null;
            }
        }
    }
    class VNodeObservable extends VNodeBuiltinComponent {
        _value;
        _textNode = null;
        constructor(reactiveNode, value) {
            super(reactiveNode);
            this._value = value;
            this.setSubscription(this._value.subscribe((value) => this.renderValue(value)));
        }
        render() {
            this.renderValue(this._value.value);
        }
        renderValue(jsxNode) {
            if ((typeof jsxNode === 'string' || typeof jsxNode === 'number')
                && this._textNode) {
                // optimized update path for text nodes
                this._textNode.textContent = String(jsxNode);
            }
            else {
                if (this.firstChild) {
                    cleanupVNode(this.firstChild);
                }
                const vNode = new VNodeRoot();
                this.firstChild = this.lastChild = vNode;
                this._textNode = null;
                const children = renderJSX(jsxNode, vNode);
                if (children.length === 1 && children[0] instanceof Text) {
                    this._textNode = children[0];
                }
                this.reactiveNode.update(children);
            }
        }
    }
    class VNodeFor extends VNodeBuiltinComponent {
        _of;
        _children;
        _frontBuffer = new Map();
        _backBuffer = new Map();
        constructor(reactiveNode, props) {
            super(reactiveNode);
            const forProps = props;
            this._children = forProps.children;
            this._of = forProps.of;
            if (isObservable(this._of)) {
                this.setSubscription(this._of.subscribe((value) => this.renderValue(value)));
            }
        }
        render() {
            this.renderValue(isObservable(this._of) ? this._of.value : this._of);
        }
        renderValue(items) {
            this.firstChild = this.lastChild = null;
            const children = [];
            const n = items.length;
            for (let i = 0; i < n; ++i) {
                const value = items[i];
                let item = this._frontBuffer.get(value);
                if (item) {
                    this._frontBuffer.delete(value);
                    item.index.value = i;
                }
                else {
                    const index = val(i);
                    const vNode = new VNodeRoot();
                    const children = renderJSX(this._children({ item: value, index }), vNode);
                    item = { index, vNode, children: children.length > 0 ? children : null };
                }
                appendVNodeChild(this, item.vNode);
                if (item.children) {
                    children.push(...item.children);
                }
                this._backBuffer.set(value, item);
            }
            if (this.lastChild) {
                this.lastChild.next = null;
            }
            [this._frontBuffer, this._backBuffer] = [this._backBuffer, this._frontBuffer];
            for (const item of this._backBuffer.values()) {
                cleanupVNode(item.vNode);
            }
            this._backBuffer.clear();
            this.reactiveNode.update(children);
        }
    }
    class VNodeShow extends VNodeBuiltinComponent {
        _when;
        _is;
        _keyed;
        _children;
        _fallback;
        _shown = null;
        constructor(reactiveNode, props) {
            super(reactiveNode);
            const showProps = props;
            this._when = showProps.when;
            this._is = showProps.is;
            this._keyed = showProps.keyed ?? false;
            this._children = showProps.children;
            this._fallback = showProps.fallback ?? null;
            if (isObservable(this._when)) {
                this.setSubscription(this._when.subscribe((value) => this.renderValue(value)));
            }
        }
        render() {
            this.renderValue(isObservable(this._when) ? this._when.value : this._when);
        }
        renderValue(value) {
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
            if (this.firstChild) {
                cleanupVNode(this.firstChild);
            }
            this.firstChild = this.lastChild = null;
            const jsxNode = show ? this._children : this._fallback;
            if (jsxNode) {
                const vNode = new VNodeRoot();
                this.firstChild = this.lastChild = vNode;
                const children = renderJSX(typeof jsxNode === 'function' ? jsxNode(value) : jsxNode, vNode);
                this.reactiveNode.update(children);
            }
            else {
                this.reactiveNode.update(null);
            }
        }
    }
    class VNodeWith extends VNodeBuiltinComponent {
        _value;
        _children;
        constructor(reactiveNode, props) {
            super(reactiveNode);
            const withProps = props;
            this._value = withProps.value;
            this._children = withProps.children;
            if (isObservable(this._value)) {
                this.setSubscription(this._value.subscribe((value) => this.renderValue(value)));
            }
        }
        render() {
            this.renderValue(isObservable(this._value) ? this._value.value : this._value);
        }
        renderValue(value) {
            if (this.firstChild) {
                cleanupVNode(this.firstChild);
            }
            const vNode = new VNodeRoot();
            this.firstChild = this.lastChild = vNode;
            const children = renderJSX(this._children(value), vNode);
            this.reactiveNode.update(children);
        }
    }
    class VNodeWithMany extends VNodeBuiltinComponent {
        _values;
        _children;
        constructor(reactiveNode, props) {
            super(reactiveNode);
            const withManyProps = props;
            this._values = withManyProps.values;
            this._children = withManyProps.children;
            const observables = [];
            for (let i = 0; i < this._values.length; ++i) {
                const value = this._values[i];
                if (isObservable(value)) {
                    observables.push(value);
                }
            }
            if (observables.length > 0) {
                this.setSubscription(subscribe(observables, () => {
                    this.render();
                }));
            }
        }
        render() {
            this.renderValue(...this._values.map(value => isObservable(value) ? value.value : value));
        }
        renderValue(...values) {
            if (this.firstChild) {
                cleanupVNode(this.firstChild);
            }
            const vNode = new VNodeRoot();
            this.firstChild = this.lastChild = vNode;
            const children = renderJSX(this._children(...values), vNode);
            this.reactiveNode.update(children);
        }
    }
    const BuiltinComponentMap = new Map([
        [For, VNodeFor],
        [Show, VNodeShow],
        [With, VNodeWith],
        [WithMany, VNodeWithMany],
    ]);

    async function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    const TestCounter = ({ initialValue: initialCount = 1 }, { defineRef }) => {
        let count = initialCount;
        const countElem = ref();
        const setCount = (newCount) => {
            count = newCount;
            if (!countElem.value)
                return;
            countElem.value.textContent = count.toString();
        };
        const increment = () => setCount(count + 1);
        const decrement = () => setCount(count - 1);
        defineRef({
            increment,
            decrement,
            get count() {
                return count;
            },
        });
        return jsx("span", { ref: countElem, children: count });
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const TestSpan = (props) => {
        return jsx("span", { children: "Test span" });
    };

    const TestUI = ({ uId = '1-1' }, { defineRef }) => {
        const counter = ref();
        defineRef({
            get count() {
                return counter.value?.count ?? NaN;
            },
        });
        return (jsx("div", { style: {
                position: 'fixed',
                display: 'flex',
                flexDirection: 'column',
                left: '0px',
                top: '0px',
                zIndex: '10000',
                width: '100px',
                height: '300px',
            }, children: jsx(Fragment, { children: [uId, jsx(TestCounter, { ref: counter }), jsx("button", { "on:click": () => counter.value?.increment(), children: "Increment" }), jsx("button", { "on:click": () => counter.value?.decrement(), children: "Decrement" }), jsx("button", { "on:click": () => alert(counter.value?.count), children: "Show count" }), jsx(TestSpan, {})] }) }));
    };

    async function main() {
        // comment
        console.info('Hi!');
        await sleep(1000);
        console.info('Bye!');
        void render(document.body, jsx(TestUI, {}));
    }
    void main();

})();
