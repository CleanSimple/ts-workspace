declare global {
    interface Array<T> {
        first: () => T | undefined;
        last: () => T | undefined;
        insertAt: (index: number, ...items: T[]) => void;
        removeAt: (index: number) => T | undefined;
        remove: (item: T) => void;
    }
}

Array.prototype.first = function(this: unknown[]) {
    return this[0];
};

Array.prototype.last = function(this: unknown[]) {
    return this[this.length - 1];
};

Array.prototype.insertAt = function(this: unknown[], index: number, ...items: unknown[]) {
    return this.splice(index, 0, ...items);
};

Array.prototype.removeAt = function(this: unknown[], index: number) {
    return this.splice(index, 1)[0];
};

Array.prototype.remove = function(this: unknown[], item: unknown) {
    const index = this.indexOf(item);
    if (index !== -1) {
        this.splice(index, 1);
    }
};
