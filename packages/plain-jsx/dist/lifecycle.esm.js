import { subscribe } from './observable.esm.js';

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
function watch(observable, observer) {
    if (!_CurrentFunctionalComponent) {
        throw new Error('watch can only be called inside a functional component');
    }
    _CurrentFunctionalComponent.addSubscription(observable.subscribe(observer));
}
function watchMany(observables, observer) {
    if (!_CurrentFunctionalComponent) {
        throw new Error('watchMany can only be called inside a functional component');
    }
    _CurrentFunctionalComponent.addSubscription(subscribe(observables, observer));
}
function mountVNodes(head, tail = null) {
    let node = head;
    while (node) {
        mountVNode(node);
        if (node === tail) {
            break;
        }
        node = node.next;
    }
}
function unmountVNodes(head, tail = null) {
    let node = head;
    while (node) {
        unmountVNode(node);
        if (node === tail) {
            break;
        }
        node = node.next;
    }
}
function mountVNode(vNode) {
    // mount children
    let child = vNode.firstChild;
    while (child) {
        mountVNode(child);
        child = child.next;
    }
    // mount self
    if (vNode.type === 'component') {
        vNode.mount();
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
        vNode.unmount();
    }
}

export { defineRef, mountVNodes, onMount, onUnmount, setCurrentFunctionalComponent, unmountVNodes, watch, watchMany };
