/**
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
export function arrFirst(arr) {
    return arr[0];
}
/**
 * @template T
 * @param {T[]} arr
 * @param {T | null} [defaultValue=null]
 * @returns {T | null}
 */
export function arrFirstOr(arr, defaultValue = null) {
    return arr.length ? arr[0] : defaultValue;
}
/**
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
export function arrLast(arr) {
    return arr[arr.length - 1];
}
/**
 * @template T
 * @param {T[]} arr
 * @param {T | null} [defaultValue=null]
 * @returns {T | null}
 */
export function arrLastOr(arr, defaultValue = null) {
    return arr.length ? arr[arr.length - 1] : defaultValue;
}
/**
 * @template T
 * @param {T[]} arr
 * @param {number} index
 * @returns {T}
 */
export function arrRemoveAt(arr, index) {
    return arr.splice(index, 1)[0];
}
/**
 * @template T
 * @param {T[]} arr
 * @param {number} index
 * @param {...T} [items]
 * @returns {void}
 */
export function arrInsertAt(arr, index, ...items) {
    arr.splice(index, 0, ...items);
}
/**
 * @template T
 * @param {T[]} arr
 * @param {T} item
 * @returns {void}
 */
export function arrRemove(arr, item) {
    const index = arr.indexOf(item);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}
