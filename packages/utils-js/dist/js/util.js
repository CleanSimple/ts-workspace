/** @import { Primitive } from './types' */
/**
 * @template {object} T
 * @param {T} obj
 * @param {PropertyKey} key
 * @returns {key is keyof T}
 */
export function hasKey(obj, key) {
    return key in obj;
}
/**
 * @param {Error} error
 * @returns {never}
 */
export function fail(error) {
    throw error;
}
/**
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function rndInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * @param {string} string
 * @returns {string}
 */
export function base64Encode(string) {
    const bytes = new TextEncoder().encode(string);
    const binaryString = Array.from(bytes)
        .map(byte => String.fromCharCode(byte))
        .join('');
    return window.btoa(binaryString);
}
/**
 * @param {string | Blob | ArrayBuffer} content
 * @param {DownloadOptions} [options={}]
 * @returns {void}
 */
export function download(content, options = {}) {
    const downloadUrl = URL.createObjectURL(new Blob([content], options.mimeType ? { type: options.mimeType } : {}));
    const elem = document.createElement('a');
    elem.href = downloadUrl;
    elem.download = options.filename ?? '';
    elem.style.display = 'none';
    elem.click();
    URL.revokeObjectURL(downloadUrl);
}
/**
 * @param {FileSelectOptions} [options={}]
 * @returns {Promise<FileList | null>}
 */
export async function fileSelect(options = {}) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = options.accept ?? '';
        input.multiple = options.multiple ?? false;
        const onFileSelect = () => {
            window.removeEventListener('focus', onFileSelect);
            setTimeout(() => {
                resolve(input.files);
            }, 1000);
        };
        window.addEventListener('focus', onFileSelect);
        input.click();
    });
}
/**
 * @template {(...args: never[]) => void} T
 * @param {T} func
 * @param {number} timeout
 * @returns {T}
 */
export function debounce(func, timeout) {
    let timeoutId = 0;
    return ((...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, timeout, ...args);
    });
}
/**
 * @param {unknown} value
 * @returns {value is Primitive}
 */
export function isPrimitive(value) {
    return (value === null
        || (typeof value !== 'object' && typeof value !== 'function'));
}
/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
export function isObject(value) {
    return typeof value === 'object'
        && value !== null
        && Object.getPrototypeOf(value) === Object.prototype;
}
/**
 * @param {object} prototype
 * @param {object} properties
 * @returns {void}
 */
export function extendPrototype(prototype, properties) {
    for (const key of Object.keys(properties)) {
        const desc = Object.getOwnPropertyDescriptor(properties, key);
        desc.enumerable = false;
        Object.defineProperty(prototype, key, desc);
    }
}
/**
 * @typedef {Object} DownloadOptions
 * @property {string} [filename]
 * @property {string} [mimeType]
 */
/**
 * @typedef {Object} FileSelectOptions
 * @property {string} [accept]
 * @property {boolean} [multiple]
 */
