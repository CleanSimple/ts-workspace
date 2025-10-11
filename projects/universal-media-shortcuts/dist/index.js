// ==UserScript==
// @name         Universal Media Shortcuts
// @description  Adds custom shortcuts to video players
// @version      0.24.0
// @author       Nour Nasser
// @namespace    https://github.com/Nourz1234
// @match        *://*/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://raw.githubusercontent.com/Nourz1234/user-scripts/main/projects/universal-media-shortcuts/dist/index.js
// @downloadURL  https://raw.githubusercontent.com/Nourz1234/user-scripts/main/projects/universal-media-shortcuts/dist/index.js
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

    async function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    function hasKey(obj, key) {
        return key in obj;
    }
    function isObject(value) {
        return typeof value === 'object'
            && value !== null
            && Object.getPrototypeOf(value) === Object.prototype;
    }

    const Hotkeys = [
        {
            code: 'BracketRight',
            handler: (context) => context.playerWrapper.toggleControlsVisibility(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'BracketLeft',
            handler: (context) => context.playerWrapper.toggleCaptionsVisibility(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'KeyQ',
            handler: (context) => context.playerWrapper.toggleSkipDialog(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'ArrowRight',
            handler: (context) => context.playerWrapper.skipForward(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'ArrowLeft',
            handler: (context) => context.playerWrapper.skipBackward(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'ArrowUp',
            handler: (context) => context.playerWrapper.volUp(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'ArrowDown',
            handler: (context) => context.playerWrapper.volDown(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'Space',
            handler: (context) => context.playerWrapper.togglePause(),
            noDefault: true,
            noOtherHandlers: true,
        },
        // playback speed control
        {
            code: 'ArrowRight',
            altKey: true,
            handler: (context) => context.playerWrapper.speedUp(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'ArrowLeft',
            altKey: true,
            handler: (context) => context.playerWrapper.speedDown(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'Numpad0',
            altKey: true,
            handler: (context) => context.playerWrapper.speedReset(),
            noDefault: true,
            noOtherHandlers: true,
        },
        // disable mute key
        { key: 'm', handler: null, noDefault: true, noOtherHandlers: true },
        // disable next key (9anime)
        { key: 'n', handler: null, noDefault: true, noOtherHandlers: true },
        // disable back key (9anime)
        { key: 'b', handler: null, noDefault: true, noOtherHandlers: true },
        // disable the numpad
        { code: 'Numpad0', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad1', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad2', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad3', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad4', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad5', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad6', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad7', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad8', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'Numpad9', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadAdd', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadSubtract', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadMultiply', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadDivide', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadDecimal', handler: null, noDefault: true, noOtherHandlers: true },
        { code: 'NumpadEnter', handler: null, noDefault: true, noOtherHandlers: true },
        /* Skip Dialog Hotkeys */
        {
            code: 'KeyQ',
            when: 'skipping',
            handler: (context) => context.playerWrapper.toggleSkipDialog(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'Escape',
            when: 'skipping',
            handler: (context) => context.playerWrapper.toggleSkipDialog(),
            noDefault: true,
            noOtherHandlers: true,
        },
        {
            code: 'Enter',
            when: 'skipping',
            handler: (context) => context.playerWrapper.skipDialogAccept(),
            noDefault: true,
            noOtherHandlers: true,
        },
    ];

    var skipDlgStyles = `:root {
    --main-color: #1939F5;
    --border-color: #404040;
    --border-active-color: #0a2ae8;
    --background-color: #151515;
    --text-color: #C0C0C5;
}


.skip-dlg-container {
    all: revert;

    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition-duration: 0.2s;
    /* font */
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: initial;
    font-weight: initial;
    font-style: initial;
    color: var(--text-color);

    * {
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        font-style: inherit;
        color: inherit;
    }

    .backdrop {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        width: 100%;
        height: 100%;
    }
}


.skip-dlg {
    box-shadow: 0px 0px 10px var(--main-color);
    background: var(--background-color);
    z-index: 100;

    .title {
        text-align: center;
        background: var(--main-color);
        padding: 5px;
        font-weight: bold;
    }

    .body {
        padding: 5px;
        border: 1px solid var(--main-color);
        box-shadow: inset 0px 0px 10px var(--main-color);
    }

    .select-container select {
        border: 1px solid var(--border-color);
        appearance: none;
        height: 100%;
        padding: 0px 25px 0px 5px;
        background: var(--background-color);
        background-image:
            linear-gradient(45deg, transparent 50%, var(--main-color) 50%),
            linear-gradient(135deg, var(--main-color) 50%, transparent 50%),
            linear-gradient(to right, var(--border-color), var(--border-color));
        background-position:
            calc(100% - 10px) 50%,
            calc(100% - 5px) 50%,
            calc(100% - 20px) 0px;
        background-size:
            5px 5px,
            5px 5px,
            1px 100%;
        background-repeat: no-repeat;
    }

    .select-container select:hover {
        border-color: var(--border-active-color);
    }

    button {
        padding: 8px;
        background: var(--main-color);
        border: none;
    }

    button:hover {
        filter: brightness(125%);
    }

    .actions-container {
        display: flex;
        flex-direction: row-reverse;
    }
}
`;

    var styles = `/* hiding controls */
.ums-controls-hidden * {
    cursor: none !important;
}

.ums-controls-hidden.jwplayer> .jw-wrapper> :not(.jw-media, .jw-captions),
.ums-controls-hidden.video-js> :not(video, .vjs-text-track-display),
.ums-controls-hidden.plyr> :not(.plyr__video-wrapper),
.ums-controls-hidden.ytd-player>.html5-video-player> :not(.html5-video-container, .ytp-caption-window-container),
.ums-controls-hidden.pjscssed> :not(:has(> video)) {
    display: none !important;
}

/* handle dark backdrop in DoodStream player */
.ums-controls-hidden.video-js> .vjs-text-track-display {
    background: none !important;
}



/* hiding subtitles */
.ums-cc-hidden.jwplayer> .jw-wrapper> .jw-captions,
.ums-cc-hidden.video-js> .vjs-text-track-display,
/* .ums-cc-hidden.plyr> :not(.plyr__video-wrapper), */
.ums-cc-hidden.ytd-player>.html5-video-player> .ytp-caption-window-container {
    display: none !important;
}
`;

    var upDownControlStyles = `.up-down-control {
    display: flex;
    flex-direction: row;
    border: 1px solid var(--border-color);
}

.up-down-control:hover {
    border-color: var(--border-active-color);
}

.up-down-control input[type=number] {
    appearance: textfield;
    background: transparent;
    padding: 0px 3px;
    border: none;
    width: 20px;
}

.up-down-control .btn-increment,
.up-down-control .btn-decrement {
    fill: var(--main-color);
    font-size: 10px;
    padding: 3px;
    line-height: 7px;
    background: transparent;
    border: none;
}

.up-down-control .btn-increment:active svg,
.up-down-control .btn-decrement:active svg {
    transform: scale(0.7);
}
`;

    const XMLNamespaces = {
        'svg': 'http://www.w3.org/2000/svg',
        'xhtml': 'http://www.w3.org/1999/xhtml',
    };

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
    function val(initialValue) {
        return new Val(initialValue);
    }
    function ref() {
        return new Val(null);
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
        return reactiveNode;
    };

    const Fragment = 'Fragment';
    /* built-in components that have special handling */
    const BuiltinComponents = new Map([
        [Show, renderShow],
        [For, renderFor],
    ]);
    function jsx(type, props) {
        const { children } = props;
        props.children = undefined;
        return renderVNode(type, props, children);
    }
    // export let initialRenderDone = false;
    function render(root, vNode) {
        root.append(...resolveReactiveNodes(renderChildren(vNode)));
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
            domElement.append(...resolveReactiveNodes(renderChildren(children)));
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
                childNodes.push(reactiveNode);
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
                    if ((elem instanceof HTMLInputElement && InputTwoWayProps.includes(key))
                        || (elem instanceof HTMLSelectElement && SelectTwoWayProps.includes(key))) {
                        if (value instanceof Val) {
                            elem.addEventListener('change', (e) => {
                                value.value = e.target[key];
                            });
                        }
                        else {
                            elem.addEventListener('change', (e) => {
                                e.preventDefault();
                                e.target[key] = value.value;
                            });
                        }
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

    const PlayersSelector = [
        '.jwplayer',
        '.video-js',
        '.plyr',
        '.ytd-player', // youtube player
        '.pjscssed', // PlayerJS
    ].join(',');

    function UpDown({ value = 1, minValue = 0, maxValue = 99, ...props }) {
        const inputRef = ref();
        function increment() {
            const { value: input } = inputRef;
            if (!input)
                throw new Error();
            const value = Math.min(maxValue, input.valueAsNumber + 1);
            if (value != input.valueAsNumber) {
                input.valueAsNumber = value;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        function decrement() {
            const { value: input } = inputRef;
            if (!input)
                throw new Error();
            const value = Math.max(minValue, input.valueAsNumber - 1);
            if (value != input.valueAsNumber) {
                input.valueAsNumber = value;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        return (jsx("div", { class: 'up-down-control', ...props, children: [jsx("input", { ref: inputRef, type: 'number', disabled: true, valueAsNumber: value, min: '0' }), jsx("div", { style: {
                        display: 'flex',
                        flexDirection: 'column',
                        borderLeft: '1px solid #404040',
                    }, children: [jsx("button", { class: 'btn-increment', "on:click": increment, children: jsx("svg:svg", { height: '7', width: '7', children: jsx("svg:path", { d: 'M0,7 L3.5,0 L7,7 Z' }) }) }), jsx("button", { class: 'btn-decrement', "on:click": decrement, children: jsx("svg:svg", { height: '7', width: '7', children: jsx("svg:path", { d: 'M0,0 L3.5,7 L7,0 Z' }) }) })] })] }));
    }

    const SkipDlg = ({ skipMins: initialSkipMins = 0, skipSecs: initialSkipSecs = 30, onAccept, onClosed }, { defineRef }) => {
        const container = ref();
        const skipMins = val(initialSkipMins);
        const skipSecs = val(initialSkipSecs);
        function close() {
            container.value?.remove();
            onClosed?.();
        }
        function handleCancel() {
            close();
        }
        function handleOk() {
            onAccept?.(skipMins.value, skipSecs.value);
            close();
        }
        defineRef({ cancel: handleCancel, accept: handleOk });
        return (jsx("div", { ref: container, class: 'skip-dlg-container', style: { opacity: 1 }, children: [jsx("div", { class: 'backdrop' }), jsx("div", { class: 'skip-dlg', children: [jsx("div", { class: 'title', children: jsx("label", { children: "Skip" }) }), jsx("div", { class: 'body', children: [jsx("div", { style: { display: 'flex', flexDirection: 'row', alignItems: 'baseline' }, children: [jsx("label", { children: "Mins:" }), jsx(UpDown, { value: skipMins, style: { marginLeft: '5px' } }), jsx("label", { style: { marginLeft: '5px' }, children: "Secs:" }), jsx(UpDown, { value: skipMins, maxValue: 59, style: { marginLeft: '5px' } })] }), jsx("div", { class: 'actions-container', style: { marginTop: '5px' }, children: [jsx("button", { "on:click": handleCancel, children: "Cancel" }), jsx("button", { style: { marginRight: '5px' }, "on:click": handleOk, children: "Ok" })] })] })] })] }));
    };

    class PlayerWrapper {
        static Create(video) {
            const player = video.closest(PlayersSelector);
            if (player === null) {
                // alert('Player not supported!');
                return null;
            }
            return new PlayerWrapper(player, video);
        }
        playerElement;
        videoElement;
        skipDlgRef = ref();
        constructor(playerElement, videoElement) {
            this.playerElement = playerElement;
            this.videoElement = videoElement;
        }
        get status() {
            if (this.skipDlgRef.value) {
                return 'skipping';
            }
            return this.videoElement.paused ? 'paused' : 'playing';
        }
        isEventSource(event) {
            if (event.target instanceof HTMLElement) {
                return event.target === this.playerElement || event.target === this.videoElement
                    || this.playerElement.contains(event.target);
            }
            return false;
        }
        focus() {
            this.videoElement.focus();
        }
        toggleControlsVisibility() {
            if (this.playerElement.classList.contains('ums-controls-hidden')) {
                this.playerElement.classList.remove('ums-controls-hidden');
            }
            else {
                this.playerElement.classList.add('ums-controls-hidden');
            }
            this.videoElement.focus();
        }
        toggleCaptionsVisibility() {
            if (this.playerElement.classList.contains('ums-cc-hidden')) {
                this.playerElement.classList.remove('ums-cc-hidden');
            }
            else {
                this.playerElement.classList.add('ums-cc-hidden');
            }
        }
        toggleSkipDialog() {
            if (this.skipDlgRef.value) {
                this.skipDlgRef.value.cancel();
                return;
            }
            const wasPlaying = !this.videoElement.paused;
            if (wasPlaying) {
                this.videoElement.pause();
            }
            const skipMins = GM_getValue('MinsValue', 1);
            const skipSecs = GM_getValue('SecsValue', 0);
            const handleAccept = (skipMins, skipSecs) => {
                GM_setValue('MinsValue', skipMins);
                GM_setValue('SecsValue', skipSecs);
                this.videoElement.currentTime += (skipMins * 60) + skipSecs;
            };
            const handleClosed = () => {
                if (wasPlaying) {
                    void this.videoElement.play();
                }
            };
            render(this.playerElement, jsx(SkipDlg, { ref: this.skipDlgRef, skipMins: skipMins, skipSecs: skipSecs, onAccept: handleAccept, onClosed: handleClosed }));
        }
        skipDialogAccept() {
            this.skipDlgRef.value?.accept();
        }
        skipForward() {
            this.videoElement.currentTime += 3;
        }
        skipBackward() {
            this.videoElement.currentTime -= 3;
        }
        volUp() {
            this.videoElement.volume = Math.min(1, this.videoElement.volume + 0.05);
        }
        volDown() {
            this.videoElement.volume = Math.max(0, this.videoElement.volume - 0.05);
        }
        togglePause() {
            if (this.videoElement.paused) {
                void this.videoElement.play();
            }
            else {
                this.videoElement.pause();
            }
        }
        speedUp() {
            this.videoElement.playbackRate += 0.05;
        }
        speedDown() {
            this.videoElement.playbackRate -= 0.05;
        }
        speedReset() {
            this.videoElement.playbackRate = 1;
        }
    }

    class VideoContextManager {
        static _ContextCache = new WeakMap();
        static getContext(event, video) {
            const cachedContext = VideoContextManager._ContextCache.get(video);
            if (cachedContext?.playerWrapper.isEventSource(event)) {
                return cachedContext;
            }
            const playerWrapper = PlayerWrapper.Create(video);
            if (playerWrapper === null) {
                return null;
            }
            if (!playerWrapper.isEventSource(event)) {
                return null;
            }
            const context = { playerWrapper };
            VideoContextManager._ContextCache.set(video, context);
            return context;
        }
    }

    const log = console.info.bind(null, '[Universal Media Shortcuts]');
    log('Starting...', window.location.href);
    GM_addStyle(styles);
    GM_addStyle(upDownControlStyles);
    GM_addStyle(skipDlgStyles);
    function matchKey(evt, hotkey) {
        const { key, code, ctrlKey = false, altKey = false, shiftKey = false } = hotkey;
        const modifiersMatch = ctrlKey === evt.ctrlKey && altKey === evt.altKey
            && shiftKey == evt.shiftKey;
        if (!modifiersMatch) {
            return false;
        }
        if (key) {
            return key === evt.key;
        }
        else if (code) {
            return code === evt.code;
        }
        return false;
    }
    function matchState(evt, hotkey, context) {
        const { when = 'default' } = hotkey;
        switch (when) {
            case 'default':
                return ['playing', 'paused'].includes(context.playerWrapper.status);
            case 'playing':
                return context.playerWrapper.status === 'playing';
            case 'paused':
                return context.playerWrapper.status === 'paused';
            case 'skipping':
                return context.playerWrapper.status === 'skipping';
        }
    }
    function makeHandler(eventHandler) {
        return (e) => {
            for (const video of document.querySelectorAll('video')) {
                const context = VideoContextManager.getContext(e, video);
                if (context) {
                    eventHandler(e, context);
                }
            }
        };
    }
    function handleKeyDown(e, context) {
        const matchingHotkeys = Hotkeys.filter(hotkey => matchKey(e, hotkey) && matchState(e, hotkey, context));
        for (const hotkey of matchingHotkeys) {
            hotkey.handler?.(context);
            if (hotkey.noDefault) {
                // no default
                e.preventDefault();
            }
            if (hotkey.noOtherHandlers) {
                // eat the event!
                e.stopImmediatePropagation();
                break;
            }
        }
    }
    function handleKeyPress(e, _context) {
        e.preventDefault();
        e.stopImmediatePropagation();
    }
    function handleKeyUp(e, _context) {
        e.preventDefault();
        e.stopImmediatePropagation();
    }
    async function handleFullscreenChange(e, context) {
        if (document.fullscreenElement) {
            await sleep(100);
            context.playerWrapper.focus();
        }
    }
    document.addEventListener('keydown', makeHandler(handleKeyDown), { capture: true });
    document.addEventListener('keyup', makeHandler(handleKeyUp), { capture: true });
    document.addEventListener('keypress', makeHandler(handleKeyPress), { capture: true });
    document.addEventListener('fullscreenchange', makeHandler(handleFullscreenChange), {
        capture: true,
    });

})();
