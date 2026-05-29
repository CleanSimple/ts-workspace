interface ArrayExtensions<T> {
    first: () => T | undefined;
    last: () => T | undefined;
    insertAt: (index: number, ...items: T[]) => void;
    removeAt: (index: number) => T | undefined;
    remove: (item: T) => void;
}
declare global {
    interface Array<T> extends ArrayExtensions<T> {
    }
}
export {};
