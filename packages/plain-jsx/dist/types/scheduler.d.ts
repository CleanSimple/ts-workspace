type MaybeAsyncAction = () => void | Promise<void>;
export declare function nextTick(callback: MaybeAsyncAction): void;
export {};
