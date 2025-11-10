import { subscribe } from './reactive.esm.js';

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
    _LifecycleContext.subscriptions.push(subscribe(observables, observer));
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

export { cleanupVNodes, defineRef, onCleanup, onMount, setLifecycleContext, watch, watchMany };
