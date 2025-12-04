import { subscribe } from '@cleansimple/plain-signals';

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
function watch(signal, observer) {
    if (!_LifecycleContext) {
        throw new Error('watch can only be called inside a functional component');
    }
    _LifecycleContext.subscriptions ??= [];
    _LifecycleContext.subscriptions.push(signal.subscribe(observer));
}
function watchMany(signals, observer) {
    if (!_LifecycleContext) {
        throw new Error('watchMany can only be called inside a functional component');
    }
    _LifecycleContext.subscriptions ??= [];
    _LifecycleContext.subscriptions.push(subscribe(signals, observer));
}
function cleanupVNode(vNode) {
    let child = vNode.firstChild;
    while (child) {
        cleanupVNode(child);
        child = child.next;
    }
    vNode.cleanup();
}

export { cleanupVNode, defineRef, onCleanup, onMount, setLifecycleContext, watch, watchMany };
