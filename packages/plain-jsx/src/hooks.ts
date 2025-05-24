import type { Action } from '@lib/utils';
import type { VNodeElement } from './types';

export let currentInstance: VNodeElement | null;

export function setCurrentInstance(instance: VNodeElement | null) {
    const prev = currentInstance;
    currentInstance = instance;
    return () => {
        currentInstance = prev;
    };
}

export function onMounted(callback: Action) {
    if (currentInstance === null) {
        throw new Error();
    }

    currentInstance.mountedHooks.push(callback);
}
