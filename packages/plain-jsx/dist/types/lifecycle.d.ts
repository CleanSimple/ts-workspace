import type { Observable, Observer, Subscription } from '@cleansimple/observable';
import type { Action, VNode } from './types';
import { subscribe } from '@cleansimple/observable';
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
export declare function watchMany<T extends readonly unknown[]>(observables: Parameters<typeof subscribe<T>>[0], observer: Parameters<typeof subscribe<T>>[1]): void;
export declare function cleanupVNodes(head: VNode, tail?: VNode | null): void;
