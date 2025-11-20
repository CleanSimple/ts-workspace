import type { Observable, Observer, Subscription } from '@cleansimple/observable';
import type { Action, VNode } from './types';

import { subscribe } from '@cleansimple/observable';

export interface LifecycleContext {
    ref: object | null;
    subscriptions: Subscription[] | null;
    onMountCallback: Action | null;
    onCleanupCallback: Action | null;
}

let _LifecycleContext: LifecycleContext | null = null;

export function setLifecycleContext(lifecycleContext: LifecycleContext | null) {
    _LifecycleContext = lifecycleContext;
}

export function defineRef(ref: object) {
    if (!_LifecycleContext) {
        throw new Error('defineRef can only be called inside a functional component');
    }
    _LifecycleContext.ref = ref;
}

export function onMount(fn: Action) {
    if (!_LifecycleContext) {
        throw new Error('onMount can only be called inside a functional component');
    }
    if (_LifecycleContext.onMountCallback) {
        throw new Error('onMount can only be called once');
    }
    _LifecycleContext.onMountCallback = fn;
}

export function onCleanup(fn: Action) {
    if (!_LifecycleContext) {
        throw new Error('onCleanup can only be called inside a functional component');
    }
    if (_LifecycleContext.onCleanupCallback) {
        throw new Error('onCleanup can only be called once');
    }
    _LifecycleContext.onCleanupCallback = fn;
}

export function watch<T>(observable: Observable<T>, observer: Observer<T>) {
    if (!_LifecycleContext) {
        throw new Error('watch can only be called inside a functional component');
    }
    _LifecycleContext.subscriptions ??= [];
    _LifecycleContext.subscriptions.push(observable.subscribe(observer));
}

export function watchMany<T extends readonly unknown[]>(
    observables: Parameters<typeof subscribe<T>>[0],
    observer: Parameters<typeof subscribe<T>>[1],
) {
    if (!_LifecycleContext) {
        throw new Error('watchMany can only be called inside a functional component');
    }
    _LifecycleContext.subscriptions ??= [];
    _LifecycleContext.subscriptions.push(subscribe(observables, observer));
}

export function cleanupVNode(vNode: VNode) {
    let child = vNode.firstChild;
    while (child) {
        cleanupVNode(child);
        child = child.next;
    }

    vNode.cleanup();
}
