// ==UserScript==
// @name         Universal Media Shortcuts
// @description  Adds custom shortcuts to video players
// @version      0.26.0
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

    async function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
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
    --main-color: #1939f5;
    --border-color: #404040;
    --border-active-color: #0a2ae8;
    --background-color: #151515;
    --text-color: #c0c0c5;
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
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
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
        background-size: 5px 5px, 5px 5px, 1px 100%;
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

.ums-controls-hidden.jwplayer > .jw-wrapper > :not(.jw-media, .jw-captions),
.ums-controls-hidden.video-js > :not(video, .vjs-text-track-display),
.ums-controls-hidden.plyr > :not(.plyr__video-wrapper),
.ums-controls-hidden.ytd-player
    > .html5-video-player
    > :not(.html5-video-container, .ytp-caption-window-container),
.ums-controls-hidden.pjscssed > :not(:has(> video)) {
    display: none !important;
}

/* handle subtitles jumping on pause in jw-player */
.ums-controls-hidden.jwplayer > .jw-wrapper > .jw-captions {
    max-height: none !important;
}

/* handle dark backdrop in DoodStream player */
.ums-controls-hidden.video-js > .vjs-text-track-display {
    background: none !important;
}

/* hiding subtitles */
.ums-cc-hidden.jwplayer > .jw-wrapper > .jw-captions,
.ums-cc-hidden.video-js > .vjs-text-track-display,
/* .ums-cc-hidden.plyr> :not(.plyr__video-wrapper), */
.ums-cc-hidden.ytd-player > .html5-video-player > .ytp-caption-window-container {
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

.up-down-control input[type="number"] {
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

    const Fragment = 'Fragment';

    function jsx(type, props) {
        return { type, props };
    }

    const IDependency_registerDependent = Symbol('IDependency_registerDependent');

    const IDependent_onDependencyUpdated = Symbol('IDependent_onDependencyUpdated');

    class Schedulable {
        _isScheduled = false;
        schedule() {
            if (Schedulable._cyclicScheduleCount >= 100) {
                // break the cycle to avoid starving the event loop
                throw new Error('Too many nested updates');
            }
            if (this._isScheduled)
                return;
            this._isScheduled = true;
            this.onSchedule();
            Schedulable._pendingItems.push(this);
            if (Schedulable._pendingItems.length === 1) {
                queueMicrotask(Schedulable.flush);
            }
        }
        /* static members */
        static _pendingItems = [];
        static _cyclicScheduleCount = 0;
        static flush() {
            const items = Schedulable._pendingItems;
            Schedulable._pendingItems = [];
            for (let i = 0; i < items.length; ++i) {
                const item = items[i];
                item._isScheduled = false;
                try {
                    item.onDispatch();
                }
                catch (e) {
                    console.error(e);
                }
            }
            // track cyclic scheduling
            if (Schedulable._pendingItems.length > 0) {
                Schedulable._cyclicScheduleCount++;
            }
            else {
                Schedulable._cyclicScheduleCount = 0;
            }
        }
    }

    const SignalSymbol = Symbol('Signal');
    class Signal extends Schedulable {
        [SignalSymbol] = true;
        _lastDependentId = 0;
        _lastObserverId = 0;
        _dependents = null;
        _observers = null;
        _prevValue = null;
        notifyDependents() {
            if (!this._dependents?.size)
                return;
            for (const [id, ref] of this._dependents.entries()) {
                const dependent = ref.deref();
                if (dependent) {
                    dependent[IDependent_onDependencyUpdated]();
                }
                else {
                    this._dependents.delete(id);
                }
            }
        }
        onSchedule() {
            this._prevValue = this.value;
        }
        onDispatch() {
            const prevValue = this._prevValue;
            this._prevValue = null;
            if (!this._observers?.size)
                return;
            const value = this.value;
            if (value === prevValue)
                return;
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
            const id = ++this._lastObserverId;
            this._observers ??= new Map();
            this._observers.set(id, observer);
            return {
                unsubscribe: () => {
                    this._observers.delete(id);
                },
            };
        }
        /* IDependency */
        [IDependency_registerDependent](dependent) {
            const id = ++this._lastDependentId;
            this._dependents ??= new Map();
            this._dependents.set(id, new WeakRef(dependent));
            return {
                unregister: () => {
                    this._dependents.delete(id);
                },
            };
        }
    }

    const SENTINEL = Symbol('SENTINEL');

    class ComputedSignal extends Signal {
        _value = SENTINEL;
        _shouldCompute = true;
        get value() {
            if (this._shouldCompute) {
                this._shouldCompute = false;
                this._value = this.compute();
            }
            return this._value;
        }
        /* IDependent */
        [IDependent_onDependencyUpdated]() {
            this.schedule();
            this._shouldCompute = true;
            this.notifyDependents();
        }
    }

    /**
     * Single source computed signal
     */
    class ComputedSingle extends ComputedSignal {
        _signal;
        _compute;
        constructor(signal, compute) {
            super();
            this._signal = signal;
            this._compute = compute;
            signal[IDependency_registerDependent](this);
        }
        compute() {
            return this._compute(this._signal.value);
        }
    }

    class MultiSourceSubscription extends Schedulable {
        _signals;
        _observer;
        _registrations;
        constructor(signals, observer) {
            super();
            this._signals = signals;
            this._observer = observer;
            this._registrations = [];
            for (let i = 0; i < signals.length; ++i) {
                this._registrations.push(signals[i][IDependency_registerDependent](this));
            }
        }
        onSchedule() { }
        onDispatch() {
            this._observer(...this._signals.map(signal => signal.value));
        }
        unsubscribe() {
            for (let i = 0; i < this._registrations.length; ++i) {
                this._registrations[i].unregister();
            }
        }
        /* IDependent */
        [IDependent_onDependencyUpdated]() {
            this.schedule();
        }
    }

    /**
     * Simple value signal implementation
     */
    class Val extends Signal {
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
            this.schedule();
            this._value = newValue;
            this.notifyDependents();
        }
    }

    Signal.prototype.computed = function (compute) {
        return new ComputedSingle(this, compute);
    };

    /**
     * Proxy signal
     */
    class ReadOnlyVal extends Signal {
        _signal;
        _value;
        constructor(signal) {
            super();
            this._signal = signal;
            this._value = signal.value;
            signal[IDependency_registerDependent](this);
        }
        get value() {
            return this._value;
        }
        /* IDependent */
        [IDependent_onDependencyUpdated]() {
            this.schedule();
            this._value = this._signal.value;
            this.notifyDependents();
        }
    }

    Val.prototype.asReadOnly = function () {
        return new ReadOnlyVal(this);
    };

    function val(initialValue) {
        return new Val(initialValue);
    }
    function subscribe(signal, observer) {
        return new MultiSourceSubscription(signal, observer);
    }
    function isSignal(value) {
        return value instanceof Signal;
    }
    function isVal(value) {
        return value instanceof Val;
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
                if (isSignal(value)) {
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
                if (isSignal(value)) {
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
            else if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') {
                const textNode = document.createTextNode(String(node));
                domNodes.push(textNode);
            }
            // render signals
            else if (isSignal(node)) {
                const reactiveNode = new ReactiveNode();
                const vNode = new VNodeSignal(reactiveNode, node);
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
    class VNodeSignal extends VNodeBuiltinComponent {
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
        renderValue(value) {
            if ((typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint')
                && this._textNode) {
                // optimized update path for text nodes
                this._textNode.textContent = String(value);
            }
            else {
                if (this.firstChild) {
                    cleanupVNode(this.firstChild);
                }
                const vNode = new VNodeRoot();
                this.firstChild = this.lastChild = vNode;
                this._textNode = null;
                const children = renderJSX(value, vNode);
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
            if (isSignal(this._of)) {
                this.setSubscription(this._of.subscribe((value) => this.renderValue(value)));
            }
        }
        render() {
            this.renderValue(isSignal(this._of) ? this._of.value : this._of);
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
            if (isSignal(this._when)) {
                this.setSubscription(this._when.subscribe((value) => this.renderValue(value)));
            }
        }
        render() {
            this.renderValue(isSignal(this._when) ? this._when.value : this._when);
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
            if (isSignal(this._value)) {
                this.setSubscription(this._value.subscribe((value) => this.renderValue(value)));
            }
        }
        render() {
            this.renderValue(isSignal(this._value) ? this._value.value : this._value);
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
            const signals = [];
            for (let i = 0; i < this._values.length; ++i) {
                const value = this._values[i];
                if (isSignal(value)) {
                    signals.push(value);
                }
            }
            if (signals.length > 0) {
                this.setSubscription(subscribe(signals, () => {
                    this.render();
                }));
            }
        }
        render() {
            this.renderValue(...this._values.map(value => isSignal(value) ? value.value : value));
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

    const PlayersSelector = [
        '.jwplayer',
        '.video-js',
        '.plyr',
        '.ytd-player', // youtube player
        '.pjscssed', // PlayerJS
    ].join(',');

    const UpDown = ({ value = 1, minValue = 0, maxValue = 99, ...props }) => {
        const inputRef = ref();
        function increment() {
            const { current: input } = inputRef;
            if (!input)
                throw new Error();
            const value = Math.min(maxValue, input.valueAsNumber + 1);
            if (value != input.valueAsNumber) {
                input.valueAsNumber = value;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        function decrement() {
            const { current: input } = inputRef;
            if (!input)
                throw new Error();
            const value = Math.max(minValue, input.valueAsNumber - 1);
            if (value != input.valueAsNumber) {
                input.valueAsNumber = value;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        return (jsx("div", { class: 'up-down-control', ...props, children: [jsx("input", { ref: inputRef, type: 'number', disabled: true, valueAsNumber: value }), jsx("div", { style: {
                        display: 'flex',
                        flexDirection: 'column',
                        borderLeft: '1px solid #404040',
                    }, children: [jsx("button", { class: 'btn-increment', "on:click": increment, children: jsx("svg:svg", { height: '7', width: '7', children: jsx("svg:path", { d: 'M0,7 L3.5,0 L7,7 Z' }) }) }), jsx("button", { class: 'btn-decrement', "on:click": decrement, children: jsx("svg:svg", { height: '7', width: '7', children: jsx("svg:path", { d: 'M0,0 L3.5,7 L7,0 Z' }) }) })] })] }));
    };

    const SkipDlg = ({ skipMins: initialSkipMins = 0, skipSecs: initialSkipSecs = 30, onAccept, onClosed }, { defineRef }) => {
        const skipMins = val(initialSkipMins);
        const skipSecs = val(initialSkipSecs);
        function close() {
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
        return (jsx("div", { class: 'skip-dlg-container', children: [jsx("div", { class: 'backdrop' }), jsx("div", { class: 'skip-dlg', children: [jsx("div", { class: 'title', children: jsx("label", { children: "Skip" }) }), jsx("div", { class: 'body', children: [jsx("div", { style: { display: 'flex', flexDirection: 'row', alignItems: 'baseline' }, children: [jsx("label", { children: "Mins:" }), jsx(UpDown, { value: skipMins, style: { marginLeft: '5px' } }), jsx("label", { style: { marginLeft: '5px' }, children: "Secs:" }), jsx(UpDown, { value: skipSecs, maxValue: 59, style: { marginLeft: '5px' } })] }), jsx("div", { class: 'actions-container', style: { marginTop: '5px' }, children: [jsx("button", { "on:click": handleCancel, children: "Cancel" }), jsx("button", { style: { marginRight: '5px' }, "on:click": handleOk, children: "Ok" })] })] })] })] }));
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
        skipDlgRoot = val(null);
        constructor(playerElement, videoElement) {
            this.playerElement = playerElement;
            this.videoElement = videoElement;
            render(this.playerElement, this.skipDlgRoot);
        }
        get status() {
            if (this.skipDlgRef.current) {
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
            if (this.skipDlgRef.current) {
                this.skipDlgRef.current.cancel();
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
                this.skipDlgRoot.value = null;
            };
            this.skipDlgRoot.value = (jsx(SkipDlg, { ref: this.skipDlgRef, skipMins: skipMins, skipSecs: skipSecs, onAccept: handleAccept, onClosed: handleClosed }));
        }
        skipDialogAccept() {
            this.skipDlgRef.current?.accept();
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
