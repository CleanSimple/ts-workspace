// ==UserScript==
// @name         YouTube Save Time
// @version      2.12.0
// @description  Save the current time to the url so it's safe to navigate to other pages and return to where you left off!
// @author       Nour Nasser
// @namespace    https://github.com/Nourz1234
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @match        https://www.youtube.com/*
// @run-at       document-end
// @noframes
// ==/UserScript==
(function () {
    'use strict';

    Array.prototype.first = function () {
        return this[0];
    };
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
    Array.prototype.insertAt = function (index, ...items) {
        return this.splice(index, 0, ...items);
    };
    Array.prototype.removeAt = function (index) {
        return this.splice(index, 1)[0];
    };
    Array.prototype.remove = function (item) {
        const index = this.indexOf(item);
        if (index !== -1) {
            this.splice(index, 1);
        }
    };

    function hasKey(obj, key) {
        return key in obj;
    }
    function isObject(value) {
        return typeof value === 'object'
            && value !== null
            && Object.getPrototypeOf(value) === Object.prototype;
    }

    const XMLNamespaces = {
        'svg': 'http://www.w3.org/2000/svg',
        'xhtml': 'http://www.w3.org/1999/xhtml',
    };

    let callbacks = new Array();
    let queued = false;
    function runNextTickCallbacks() {
        queued = false;
        for (const callback of callbacks) {
            callback();
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

    class Observable {
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
        computed(compute) {
            return new ComputedVal(compute, this);
        }
    }
    /** internal use */
    class ComputedVal extends Observable {
        val;
        compute;
        _value;
        constructor(compute, val) {
            super();
            this.compute = compute;
            this.val = val;
            this._value = compute(val.value);
        }
        get value() {
            return this._value;
        }
        subscribe(observer, immediate) {
            return this.val.subscribe((value) => {
                this._value = this.compute(value);
                observer(this._value);
            }, immediate);
        }
    }
    function val(initialValue) {
        return new Val(initialValue);
    }

    class MultiEntryCache {
        map = new Map();
        readIndex = new Map();
        constructor(entries = []) {
            for (const [key, value] of entries) {
                this.add(key, value);
            }
        }
        add(key, value) {
            let list = this.map.get(key);
            if (!list) {
                list = [];
                this.map.set(key, list);
                this.readIndex.set(key, 0);
            }
            list.push(value);
        }
        get(key) {
            const list = this.map.get(key);
            if (!list)
                return undefined;
            const index = this.readIndex.get(key) ?? 0;
            if (index >= list.length)
                return undefined;
            const result = list[index];
            this.readIndex.set(key, index + 1);
            return result;
        }
        reset() {
            for (const key of this.map.keys()) {
                this.readIndex.set(key, 0);
            }
        }
        clear() {
            this.map.clear();
            this.readIndex.clear();
        }
    }

    class ReactiveNode {
        placeholder = document.createComment('');
        children = new Set([this.placeholder]);
        update(rNode) {
            if (rNode === null || (Array.isArray(rNode) && rNode.length === 0)) {
                // optimized clear path
                if (this.children.has(this.placeholder)) {
                    // we are already cleared
                    return;
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
                const childNodes = parent.childNodes;
                const currentChildrenSet = this.children;
                if (currentChildrenSet.size === childNodes.length
                    && newChildrenSet.isDisjointFrom(currentChildrenSet)) {
                    // optimized replace path
                    parent.replaceChildren(...newChildren);
                }
                else {
                    const fragment = document.createDocumentFragment(); // used in bulk updates
                    const replaceCount = Math.min(currentChildrenSet.size, newChildren.length);
                    const replacedSet = new Set();
                    const start = Array.prototype.indexOf.call(childNodes, first);
                    for (let i = 0; i < replaceCount; ++i) {
                        const child = childNodes[start + i];
                        if (!child) {
                            parent.append(...newChildren.slice(i));
                            break;
                        }
                        else if (!currentChildrenSet.has(child)) {
                            fragment.append(...newChildren.slice(i));
                            parent.insertBefore(fragment, child);
                            break;
                        }
                        else if (child !== newChildren[i]) {
                            if (!replacedSet.has(newChildren[i])) {
                                parent.replaceChild(newChildren[i], child);
                                replacedSet.add(child);
                            }
                            else {
                                parent.insertBefore(newChildren[i], child);
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
            if (!this.children.size) {
                throw new Error('?!?!?!?');
            }
            return [...this.children];
        }
    }
    const Show = 'Show';
    const renderShow = (props, children, renderChildren) => {
        const { when, cache } = props;
        if (when instanceof Observable === false) {
            throw new Error("The 'when' prop on <Show> is required and must be an Observable.");
        }
        const childrenOrFn = children;
        const getChildren = typeof childrenOrFn === 'function' ? childrenOrFn : () => childrenOrFn;
        let childNodes = null;
        const render = cache === false
            ? () => renderChildren(getChildren())
            : () => childNodes ??= renderChildren(getChildren());
        const reactiveNode = new ReactiveNode();
        if (when.value) {
            reactiveNode.update(render());
        }
        when.subscribe((value) => {
            reactiveNode.update(value ? render() : null);
        });
        return reactiveNode.getRoot();
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function With(props) {
        throw new Error('This component cannot be called directly — it must be used through the render function.');
    }
    const renderWith = (props, children, renderChildren) => {
        const { value } = props;
        if (value instanceof Observable === false) {
            throw new Error("The 'value' prop on <With> is required and must be an Observable.");
        }
        if (typeof children !== 'function') {
            throw new Error('The <With> component must have exactly one child — a function that maps the value.');
        }
        const mapFn = children;
        const reactiveNode = new ReactiveNode();
        reactiveNode.update(renderChildren(mapFn(value.value)));
        value.subscribe((value) => {
            reactiveNode.update(renderChildren(mapFn(value)));
        });
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

    const Fragment = 'Fragment';
    /* built-in components that have special handling */
    const BuiltinComponents = new Map([
        [Show, renderShow],
        [With, renderWith],
        [For, renderFor],
    ]);
    function jsx(type, props) {
        const { children } = props;
        props.children = undefined;
        return renderVNode(type, props, children);
    }
    // export let initialRenderDone = false;
    function render(root, vNode) {
        root.append(...renderChildren(vNode));
        // initialRenderDone = true;
    }
    function renderVNode(type, props, children) {
        const renderBuiltin = BuiltinComponents.get(type);
        if (renderBuiltin) {
            return renderBuiltin(props, children, renderChildren);
        }
        /* general handling */
        if (typeof type === 'function') {
            let componentRef = null;
            const defineRef = (ref) => {
                componentRef = ref;
            };
            const vNode = type({ ...props, children }, { defineRef });
            if (props['ref'] instanceof Val) {
                props['ref'].value = componentRef;
            }
            componentRef = null;
            return renderChildren(vNode);
        }
        else if (type === Fragment) {
            return renderChildren(children);
        }
        else {
            const hasNS = type.includes(':');
            const domElement = hasNS
                ? document.createElementNS(...splitNamespace(type))
                : document.createElement(type);
            // handle ref prop
            if (props['ref'] instanceof Val) {
                props['ref'].value = domElement;
                props['ref'] = undefined;
            }
            setProps(domElement, props);
            domElement.append(...renderChildren(children));
            return domElement;
        }
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
                childNodes.push(...reactiveNode.getRoot());
            }
            else {
                childNodes.push(vNode);
            }
        }
        return childNodes;
    }
    const handledEvents = new Set();
    const InputTwoWayProps = ['value', 'valueAsNumber', 'valueAsDate', 'checked', 'files'];
    const SelectTwoWayProps = ['value', 'selectedIndex'];
    function setProps(elem, props) {
        const elemObj = elem;
        let elemRef = null;
        if ('style' in props) {
            const value = props['style'];
            props['style'] = undefined;
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
        else if ('dataset' in props) {
            const value = props['dataset'];
            props['dataset'] = undefined;
            if (!isObject(value)) {
                throw new Error('Dataset value must be an object');
            }
            Object.assign(elem.dataset, value);
        }
        // handle class prop early so it doesn't overwrite class:* props
        else if ('class' in props) {
            const value = props['class'];
            props['class'] = undefined;
            elem.className = value;
        }
        for (const key in props) {
            const value = props[key];
            if (value === undefined) {
                continue;
            }
            if (key.startsWith('class:')) {
                const className = key.slice(6);
                if (value instanceof Observable) {
                    value.subscribe((value) => {
                        if (value) {
                            elem.classList.add(className);
                        }
                        else {
                            elem.classList.remove(className);
                        }
                    });
                    if (value.value) {
                        elem.classList.add(className);
                    }
                }
                else {
                    if (value) {
                        elem.classList.add(className);
                    }
                }
            }
            else if (key.startsWith('on:')) {
                const event = key.slice(3);
                elemObj[`@@${event}`] = value;
                if (!handledEvents.has(event)) {
                    handledEvents.add(event);
                    document.addEventListener(event, globalEventHandler);
                }
            }
            else if (hasKey(elem, key) && !isReadonlyProp(elem, key)) {
                if (value instanceof Observable) {
                    elemRef ??= new WeakRef(elemObj);
                    const unsubscribe = value.subscribe((value) => {
                        const elem = elemRef.deref();
                        if (!elem) {
                            unsubscribe.unsubscribe();
                            return;
                        }
                        elem[key] = value;
                    });
                    // two way updates for input element
                    if (value instanceof Val
                        && ((elem instanceof HTMLInputElement && InputTwoWayProps.includes(key))
                            || (elem instanceof HTMLSelectElement && SelectTwoWayProps.includes(key)))) {
                        elem.addEventListener('change', (e) => {
                            value.value = e.target[key];
                        });
                    }
                    elemObj[key] = value.value;
                }
                else {
                    elemObj[key] = value;
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
    }
    function splitNamespace(tagNS) {
        const [ns, tag] = tagNS.split(':', 2);
        if (!hasKey(XMLNamespaces, ns)) {
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
    function globalEventHandler(evt) {
        const key = `@@${evt.type}`;
        let node = evt.target;
        while (node) {
            const handler = node[key];
            if (handler) {
                return handler.call(node, evt);
            }
            node = node.parentNode;
        }
    }

    function SaveTimeButton({ onClick }) {
        return (jsx("yt-icon-button", { id: 'guide-button', class: 'style-scope ytd-masthead', "on:click": onClick, children: [jsx("yt-icon", { id: 'guide-icon', class: 'style-scope ytd-masthead', icon: 'yt-icons:clock' }), jsx("tp-yt-paper-tooltip", { position: 'right', offset: 0, style: { width: 'max-content' }, children: "Save Time" })] }));
    }

    const observer = new MutationObserver(onPageContentChanged);
    observer.observe(document.body, { childList: true, subtree: true });
    function saveTime() {
        const url = new URL(window.location.href);
        if (!url.toString().includes('watch?'))
            return;
        const video = document.querySelector('video');
        if (!video)
            return;
        const time = Math.floor(video.currentTime);
        const newUrl = new URL(url);
        newUrl.searchParams.set('t', `${time}s`);
        if (newUrl.toString() !== url.toString()) {
            window.history.pushState(null, '', newUrl);
        }
    }
    function onPageContentChanged() {
        addButton();
    }
    function addButton() {
        if (document.querySelector('#save-time-button-container')) {
            return;
        }
        render(document.body, jsx("div", { id: 'save-time-button-container', style: {
                position: 'fixed',
                left: '5px',
                bottom: '5px',
                borderRadius: '50%',
                backgroundColor: 'var(--yt-spec-additive-background)',
                zIndex: '100000',
            }, children: jsx(SaveTimeButton, { onClick: saveTime }) }));
    }

})();
