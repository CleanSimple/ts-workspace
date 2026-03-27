type MaybeAsyncAction = () => void | Promise<void>;
declare function nextTick(callback: MaybeAsyncAction): void;

export { nextTick };
