import type { Action } from '@cleansimple/utils-js';
import type { Observable } from '.';
import type { ObservablesOf, Observer, Subscription } from './reactive';
import type { VNode } from './types';
export interface LifecycleContext {
    ref: object | null;
    subscriptions: Subscription[] | null;
    onMountCallback: Action | null;
    onCleanupCallback: Action | null;
}
export declare function setLifecycleContext(lifecycleContext: LifecycleContext | null): void;
export declare function defineRef(ref: object): void;
export declare function onMount(fn: Action): void;
export declare function onCleanup(fn: Action): void;
export declare function watch<T>(observable: Observable<T>, observer: Observer<T>): void;
export declare function watchMany<T extends readonly unknown[]>(observables: ObservablesOf<T>, observer: (...values: T) => void): void;
export declare function cleanupVNodes(head: VNode, tail?: VNode | null): void;
