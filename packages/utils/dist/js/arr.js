"use strict";
Array.prototype.first = function () {
    return this[0];
};
Array.prototype.last = function () {
    return this[this.length - 1];
};
Array.prototype.insertAt = function (index, ...items) {
    return this.splice(index, 0, ...items);
};
Array.prototype.removeAt = function (index) {
    return this.splice(index, 1)[0];
};
Array.prototype.remove = function (item) {
    const index = this.indexOf(item);
    if (index !== -1) {
        this.splice(index, 1);
    }
};
/**
 * @namespace global
 */
/**
 * @typedef {Object} global.Array
 * @property {() => T | undefined} first
 * @property {() => T | undefined} last
 * @property {(index: number, ...items: T[]) => void} insertAt
 * @property {(index: number) => T | undefined} removeAt
 * @property {(item: T) => void} remove
 */
