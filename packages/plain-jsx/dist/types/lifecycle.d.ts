import type { Observer, Signal, Subscription } from '@cleansimple/plain-signals';
import type { Action, VNode } from './types';
import { subscribe } from '@cleansimple/plain-signals';
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
export declare function watch<T>(signal: Signal<T>, observer: Observer<T>): void;
export declare function watchMany<T extends readonly unknown[]>(signals: Parameters<typeof subscribe<T>>[0], observer: Parameters<typeof subscribe<T>>[1]): void;
export declare function cleanupVNode(vNode: VNode): void;
