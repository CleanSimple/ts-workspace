import type { Observable } from '.';
import type { ObservablesOf, Observer } from './observable';
import type { VNode, VNodeFunctionalComponent } from './types';

import { subscribe } from './observable';

let _CurrentFunctionalComponent: VNodeFunctionalComponent | null = null;

export function setCurrentFunctionalComponent(component: VNodeFunctionalComponent | null) {
    _CurrentFunctionalComponent = component;
}

export function defineRef(ref: object) {
    if (!_CurrentFunctionalComponent) {
        throw new Error('defineRef can only be called inside a functional component');
    }
    _CurrentFunctionalComponent.ref = ref;
}

export function onMount(fn: VNodeFunctionalComponent['onMountCallback']) {
    if (!_CurrentFunctionalComponent) {
        throw new Error('onMount can only be called inside a functional component');
    }
    if (_CurrentFunctionalComponent.onMountCallback) {
        throw new Error('onMount can only be called once');
    }
    _CurrentFunctionalComponent.onMountCallback = fn;
}

export function onUnmount(fn: VNodeFunctionalComponent['onUnmountCallback']) {
    if (!_CurrentFunctionalComponent) {
        throw new Error('onUnmount can only be called inside a functional component');
    }
    if (_CurrentFunctionalComponent.onUnmountCallback) {
        throw new Error('onUnmount can only be called once');
    }
    _CurrentFunctionalComponent.onUnmountCallback = fn;
}

export function watch<T>(observable: Observable<T>, observer: Observer<T>) {
    if (!_CurrentFunctionalComponent) {
        throw new Error('watch can only be called inside a functional component');
    }
    _CurrentFunctionalComponent.addSubscription(observable.subscribe(observer));
}

export function watchMany<T extends readonly unknown[]>(
    observables: ObservablesOf<T>,
    observer: (...values: T) => void,
) {
    if (!_CurrentFunctionalComponent) {
        throw new Error('watchMany can only be called inside a functional component');
    }
    _CurrentFunctionalComponent.addSubscription(subscribe(observables, observer));
}

export function mountVNodes(head: VNode, tail: VNode | null = null) {
    let node: VNode | null = head;
    while (node) {
        mountVNode(node);
        if (node === tail) {
            break;
        }
        node = node.next;
    }
}
export function unmountVNodes(head: VNode, tail: VNode | null = null) {
    let node: VNode | null = head;
    while (node) {
        unmountVNode(node);
        if (node === tail) {
            break;
        }
        node = node.next;
    }
}

function mountVNode(vNode: VNode) {
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

function unmountVNode(vNode: VNode) {
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
