import type { Action } from '@lib/utils';
import type { VNodeElement } from './types';
export declare let currentInstance: VNodeElement | null;
export declare function setCurrentInstance(instance: VNodeElement | null): () => void;
export declare function onMounted(callback: Action): void;
