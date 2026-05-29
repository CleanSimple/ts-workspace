import { extendPrototype } from '../util';

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

const arrayExtensions = <T>(): ArrayExtensions<T> => ({
    first(this: T[]) {
        return this[0];
    },
    last(this: T[]) {
        return this[this.length - 1];
    },
    insertAt(this: T[], index: number, ...items: T[]) {
        return this.splice(index, 0, ...items);
    },
    removeAt(this: T[], index: number) {
        return this.splice(index, 1)[0];
    },
    remove(this: T[], item: T) {
        const index = this.indexOf(item);
        if (index !== -1) {
            this.splice(index, 1);
        }
    },
});

extendPrototype(Array.prototype, arrayExtensions());
