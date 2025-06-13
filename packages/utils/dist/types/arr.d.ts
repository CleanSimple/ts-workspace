declare global {
    interface Array<T> {
        first: () => T | undefined;
        last: () => T | undefined;
        insertAt: (index: number, ...items: T[]) => void;
        removeAt: (index: number) => T | undefined;
        remove: (item: T) => void;
    }
}
export {};
