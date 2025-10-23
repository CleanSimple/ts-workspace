// ==UserScript==
// @name         Universal Media Shortcuts
// @description  Adds custom shortcuts to video players
// @version      0.25.0
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

    class MultiEntryCache {
        map = new Map();
        readIndex = new Map();
        constructor(entries = null) {
            if (entries) {
                this.addRange(entries);
            }
        }
        addRange(entries) {
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
        id;
        cb;
        instance;
        subscriptions;
        constructor(id, cb, instance, subscriptions) {
            this.id = id;
            this.cb = cb;
            this.instance = instance;
            this.subscriptions = subscriptions;
            this.subscriptions.set(id, this);
        }
        unsubscribe() {
            this.subscriptions.delete(this.id);
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
        subscribe(observer, instance) {
            return new SubscriptionImpl(++this._nextSubscriptionId, observer, instance ?? null, this.subscriptions);
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

    const XMLNamespaces = {
        'svg': 'http://www.w3.org/2000/svg',
        'xhtml': 'http://www.w3.org/1999/xhtml',
    };
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
            else if (hasKey(elem, key) && !isReadonlyProp(elem, key)) {
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
            if (key.startsWith('class:')) {
                const className = key.slice(6);
                const setValue = (value) => {
                    if (value) {
                        elem.classList.add(className);
                    }
                    else {
                        elem.classList.remove(className);
                    }
                };
                subscriptions.push(value.subscribe(setValue));
            }
            else if (hasKey(elem, key)) {
                const setValue = (value) => {
                    elem[key] = value;
                };
                subscriptions.push(value.subscribe(setValue));
                // two way updates for input element
                if ((elem instanceof HTMLInputElement && key in InputTwoWayProps)
                    || (elem instanceof HTMLSelectElement && key in SelectTwoWayProps)) {
                    if (value instanceof ValImpl) {
                        const handler = (e) => {
                            value.value = e.target[key];
                        };
                        elem.addEventListener('change', handler);
                        subscriptions.push({
                            unsubscribe: () => elem.removeEventListener('change', handler),
                        });
                    }
                    else {
                        const handler = (e) => {
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

    new Array();
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
    function jsx(type, props) {
        return { type, props };
    }
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
                    const vNode = new _VNodeText(textNode, node, parent);
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
                        const vNode = new _VNodeElement(domElement, node.type, node.props, parent);
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
                    const vNode = new _VNodeFunctionalComponent(node.type, node.props, parent);
                    const defineRef = (ref) => {
                        vNode.ref = ref;
                    };
                    const onMount = (fn) => {
                        vNode.onMountCallback = fn;
                    };
                    const onUnmount = (fn) => {
                        vNode.onUnmountCallback = fn;
                    };
                    const jsxNode = vNode.value(vNode.props, { defineRef, onMount, onUnmount });
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
        value;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        constructor(ref, value, parent) {
            this.type = 'text';
            this.value = value;
            this.parent = parent;
            this.ref = ref;
        }
    }
    class _VNodeFunctionalComponent {
        type;
        value;
        props;
        ref = null;
        isMounted = false;
        mountedChildrenCount = 0;
        onMountCallback = null;
        onUnmountCallback = null;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        constructor(value, props, parent) {
            this.type = 'component';
            this.value = value;
            this.props = props;
            this.parent = parent;
        }
        onMount() {
            if (this.props.ref instanceof ValImpl) {
                this.props.ref.value = this.ref;
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
            if (this.props.ref instanceof ValImpl) {
                this.props.ref.value = null;
            }
            this.mountedChildrenCount = 0; // for when forcing an unmount
            this.isMounted = false;
        }
    }
    class _VNodeElement {
        type;
        value;
        props;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        subscriptions = null;
        constructor(ref, value, props, parent) {
            this.type = 'element';
            this.value = value;
            this.props = props;
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
        value;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        subscription = null;
        _renderedChildren = null;
        constructor(ref, value, parent) {
            this.type = 'observable';
            this.value = value;
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
        value;
        props;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        subscription = null;
        cache = new MultiEntryCache();
        mapFn;
        constructor(ref, props, parent) {
            this.type = 'builtin';
            this.value = For;
            this.props = props;
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
            const renderedItems = [];
            for (let i = 0; i < n; i++) {
                const value = items[i];
                let item = this.cache.get(value);
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
                renderedItems.push([value, item]);
            }
            if (this.lastChild) {
                this.lastChild.next = null;
            }
            this.ref.update(this.firstChild ? resolveRenderedVNodes(this.firstChild) : null);
            this.cache.clear();
            this.cache.addRange(renderedItems);
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
        value;
        props;
        ref;
        parent;
        next = null;
        firstChild = null;
        lastChild = null;
        subscription = null;
        constructor(ref, props, parent) {
            this.type = 'builtin';
            this.value = Show;
            this.props = props;
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
        }
        render(value) {
            if (value) {
                const childrenOrFn = this.props.children;
                this.firstChild = this.lastChild = null;
                const children = renderJSX(typeof childrenOrFn === 'function'
                    ? childrenOrFn()
                    : childrenOrFn, this);
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
                this.skipDlgRoot.value = null;
            };
            this.skipDlgRoot.value = (jsx(SkipDlg, { ref: this.skipDlgRef, skipMins: skipMins, skipSecs: skipSecs, onAccept: handleAccept, onClosed: handleClosed }));
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
