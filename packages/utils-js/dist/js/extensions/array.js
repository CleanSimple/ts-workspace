import { extendPrototype } from '../util';
/**
 * @template T
 * @returns {ArrayExtensions<T>}
 */
const arrayExtensions = () => ({
    first() {
        return this[0];
    },
    last() {
        return this[this.length - 1];
    },
    insertAt(index, ...items) {
        return this.splice(index, 0, ...items);
    },
    removeAt(index) {
        return this.splice(index, 1)[0];
    },
    remove(item) {
        const index = this.indexOf(item);
        if (index !== -1) {
            this.splice(index, 1);
        }
    },
});
extendPrototype(Array.prototype, arrayExtensions());
/**
 * @namespace global
 */
/**
 * @typedef {Object} global.Array
 */
/**
 * @typedef {Object} ArrayExtensions
 * @property {() => T | undefined} first
 * @property {() => T | undefined} last
 * @property {(index: number, ...items: T[]) => void} insertAt
 * @property {(index: number) => T | undefined} removeAt
 * @property {(item: T) => void} remove
 */
