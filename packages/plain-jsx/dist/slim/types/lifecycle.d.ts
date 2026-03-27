import { Signal, Observer, subscribe } from '@cleansimple/plain-signals';
import { Action } from './types.js';

declare function onMount(fn: Action): void;
declare function onCleanup(fn: Action): void;
declare function watch<T>(signal: Signal<T>, observer: Observer<T>): void;
declare function watchMany<T extends readonly unknown[]>(signals: Parameters<typeof subscribe<T>>[0], observer: Parameters<typeof subscribe<T>>[1]): void;

export { onCleanup, onMount, watch, watchMany };
