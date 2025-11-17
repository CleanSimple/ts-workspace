var PlainJSX = (function (exports, observable) {
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
                if (observable.isObservable(value)) {
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
                if (observable.isObservable(value)) {
                    elem[key] = value.value;
                    subscriptions.push(value.subscribe((value) => {
                        elem[key] = value;
                    }));
                    // two way updates for input element
                    if ((elem instanceof HTMLInputElement && key in InputTwoWayProps)
                        || (elem instanceof HTMLSelectElement && key in SelectTwoWayProps)) {
                        const handler = observable.isVal(value)
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
    function onMount(fn) {
        if (!_LifecycleContext) {
            throw new Error('onMount can only be called inside a functional component');
        }
        if (_LifecycleContext.onMountCallback) {
            throw new Error('onMount can only be called once');
        }
        _LifecycleContext.onMountCallback = fn;
    }
    function onCleanup(fn) {
        if (!_LifecycleContext) {
            throw new Error('onCleanup can only be called inside a functional component');
        }
        if (_LifecycleContext.onCleanupCallback) {
            throw new Error('onCleanup can only be called once');
        }
        _LifecycleContext.onCleanupCallback = fn;
    }
    function watch(observable, observer) {
        if (!_LifecycleContext) {
            throw new Error('watch can only be called inside a functional component');
        }
        _LifecycleContext.subscriptions ??= [];
        _LifecycleContext.subscriptions.push(observable.subscribe(observer));
    }
    function watchMany(observables, observer) {
        if (!_LifecycleContext) {
            throw new Error('watchMany can only be called inside a functional component');
        }
        _LifecycleContext.subscriptions ??= [];
        _LifecycleContext.subscriptions.push(observable.subscribe(observables, observer));
    }
    function cleanupVNodes(head, tail = null) {
        let node = head;
        while (node) {
            cleanupVNode(node);
            if (node === tail) {
                break;
            }
            node = node.next;
        }
    }
    function cleanupVNode(vNode) {
        let child = vNode.firstChild;
        while (child) {
            cleanupVNode(child);
            child = child.next;
        }
        if (vNode.type === 'element') {
            vNode.cleanup();
        }
        // else if (vNode.type === 'text') {
        // }
        else if (vNode.type === 'builtin') {
            vNode.cleanup();
        }
        else if (vNode.type === 'observable') {
            vNode.cleanup();
        }
        else if (vNode.type === 'component') {
            vNode.cleanup();
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
    function render(root, jsxNode) {
        const rootVNode = new VNodeRootImpl();
        const children = resolveReactiveNodes(renderJSX(jsxNode, rootVNode));
        root.append(...children);
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
                if (parent?.type !== 'element') {
                    const vNode = new VNodeTextImpl(textNode, parent);
                    appendVNodeChild(parent, vNode);
                }
                domNodes.push(textNode);
            }
            // render observables
            else if (observable.isObservable(node)) {
                const reactiveNode = new ReactiveNode();
                const vNode = new VNodeObservableImpl(reactiveNode, node, parent);
                appendVNodeChild(parent, vNode);
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
                    let vNode;
                    if (parent?.type === 'element') {
                        // as a memory optimization we don't create vNodes for descendants of an element that are also elements
                        // we have no use for them anyway
                        vNode = parent;
                    }
                    else {
                        vNode = new VNodeElementImpl(domElement, parent);
                        appendVNodeChild(parent, vNode);
                    }
                    if (subscriptions) {
                        vNode.addSubscriptions(subscriptions);
                    }
                    const children = renderJSX(node.props.children, vNode);
                    domElement.append(...resolveReactiveNodes(children));
                    domNodes.push(domElement);
                }
                // render components
                else {
                    const VNodeConstructor = BuiltinComponentMap.get(node.type);
                    // render built-in components
                    if (VNodeConstructor) {
                        const reactiveNode = new ReactiveNode();
                        const vNode = new VNodeConstructor(reactiveNode, node.props, parent);
                        appendVNodeChild(parent, vNode);
                        domNodes.push(reactiveNode);
                    }
                    // render functional components
                    else {
                        setLifecycleContext(_lifecycleContext);
                        const jsxNode = node.type(node.props, { defineRef });
                        setLifecycleContext(null);
                        const vNode = new VNodeFunctionalComponentImpl(node.props, _lifecycleContext, parent);
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
    class VNodeRootImpl {
        type = 'root';
        parent = null;
        firstChild = null;
        lastChild = null;
        next = null;
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
        _subscriptions = null;
        constructor(ref, parent) {
            this.type = 'element';
            this.parent = parent;
            this.ref = ref;
        }
        addSubscriptions(subscriptions) {
            this._subscriptions ??= [];
            this._subscriptions.push(...subscriptions);
        }
        cleanup() {
            if (this._subscriptions) {
                for (const subscription of this._subscriptions) {
                    subscription.unsubscribe();
                }
                this._subscriptions = null;
            }
        }
    }
    class VNodeFunctionalComponentImpl {
        type;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        _refProp = null;
        _onCleanupCallback;
        _subscriptions;
        constructor(props, lifecycleContext, parent) {
            this.type = 'component';
            this.parent = parent;
            this.ref = lifecycleContext.ref;
            this._onCleanupCallback = lifecycleContext.onCleanupCallback;
            this._subscriptions = lifecycleContext.subscriptions;
            if (props.ref instanceof RefImpl) {
                this._refProp = props.ref;
                this._refProp[RefValue] = this.ref;
            }
            if (lifecycleContext.onMountCallback) {
                nextTick(lifecycleContext.onMountCallback);
            }
        }
        cleanup() {
            if (this._subscriptions) {
                const n = this._subscriptions.length;
                for (let i = 0; i < n; ++i) {
                    this._subscriptions[i].unsubscribe();
                }
            }
            this._onCleanupCallback?.();
            if (this._refProp) {
                this._refProp[RefValue] = null;
            }
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
        _textNode = null;
        constructor(ref, value, parent) {
            this.type = 'observable';
            this.parent = parent;
            this.ref = ref;
            this.render(value.value);
            this._subscription = value.subscribe((value) => this.render(value));
        }
        render(jsxNode) {
            if ((typeof jsxNode === 'string' || typeof jsxNode === 'number')
                && this._textNode) {
                // optimized update path for text nodes
                this._textNode.textContent = String(jsxNode);
            }
            else {
                if (this.firstChild) {
                    cleanupVNodes(this.firstChild);
                }
                this.firstChild = this.lastChild = null;
                this._textNode = null;
                const children = renderJSX(jsxNode, this);
                if (children.length === 1 && children[0] instanceof Text) {
                    this._textNode = children[0];
                }
                this.ref.update(children);
            }
        }
        cleanup() {
            this._subscription?.unsubscribe();
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
            else if (observable.isObservable(of)) {
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
                    this._frontBuffer.delete(value);
                    item.index.value = i;
                    if (item.head) {
                        if (this.lastChild) {
                            this.lastChild.next = item.head;
                            this.lastChild = item.tail;
                        }
                        else {
                            this.firstChild = item.head;
                            this.lastChild = item.tail;
                        }
                    }
                }
                else {
                    const index = observable.val(i);
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
            for (const item of this._frontBuffer.values()) {
                if (item.head) {
                    cleanupVNodes(item.head, item.tail);
                }
            }
            this.ref.update(this.firstChild ? resolveRenderedVNodes(this.firstChild) : null);
            [this._frontBuffer, this._backBuffer] = [this._backBuffer, this._frontBuffer];
            this._backBuffer.clear();
        }
        cleanup() {
            this._subscription?.unsubscribe();
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
            if (observable.isObservable(when)) {
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
            if (this.firstChild) {
                cleanupVNodes(this.firstChild);
            }
            this.firstChild = this.lastChild = null;
            const jsxNode = show ? this._children : this._fallback;
            if (jsxNode) {
                const children = renderJSX(typeof jsxNode === 'function' ? jsxNode(value) : jsxNode, this);
                this.ref.update(children);
            }
            else {
                this.ref.update(null);
            }
        }
        cleanup() {
            this._subscription?.unsubscribe();
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
            if (observable.isObservable(value)) {
                this.render(value.value);
                this._subscription = value.subscribe((value) => this.render(value));
            }
            else {
                this.render(value);
            }
        }
        render(value) {
            if (this.firstChild) {
                cleanupVNodes(this.firstChild);
            }
            this.firstChild = this.lastChild = null;
            const children = renderJSX(this._children(value), this);
            this.ref.update(children);
        }
        cleanup() {
            this._subscription?.unsubscribe();
        }
    }
    class VNodeWithMany {
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
            const withManyProps = props;
            const values = withManyProps.values;
            this._children = withManyProps.children;
            const args = [];
            const observables = [];
            for (let i = 0; i < values.length; ++i) {
                const value = values[i];
                if (observable.isObservable(value)) {
                    args.push(value.value);
                    observables.push(value);
                }
                else {
                    args.push(value);
                }
            }
            if (observables.length > 0) {
                this._subscription = observable.subscribe(observables, () => {
                    this.render(...values.map(value => observable.isObservable(value) ? value.value : value));
                });
            }
            this.render(...args);
        }
        render(...values) {
            if (this.firstChild) {
                cleanupVNodes(this.firstChild);
            }
            this.firstChild = this.lastChild = null;
            const children = renderJSX(this._children(...values), this);
            this.ref.update(children);
        }
        cleanup() {
            this._subscription?.unsubscribe();
        }
    }
    const BuiltinComponentMap = new Map([
        [For, VNodeFor],
        [Show, VNodeShow],
        [With, VNodeWith],
        [WithMany, VNodeWithMany],
    ]);

    Object.defineProperty(exports, "computed", {
        enumerable: true,
        get: function () { return observable.computed; }
    });
    Object.defineProperty(exports, "subscribe", {
        enumerable: true,
        get: function () { return observable.subscribe; }
    });
    Object.defineProperty(exports, "task", {
        enumerable: true,
        get: function () { return observable.task; }
    });
    Object.defineProperty(exports, "val", {
        enumerable: true,
        get: function () { return observable.val; }
    });
    exports.For = For;
    exports.Fragment = Fragment;
    exports.Show = Show;
    exports.With = With;
    exports.WithMany = WithMany;
    exports.nextTick = nextTick;
    exports.onCleanup = onCleanup;
    exports.onMount = onMount;
    exports.ref = ref;
    exports.render = render;
    exports.watch = watch;
    exports.watchMany = watchMany;

    return exports;

})({}, Observable);
