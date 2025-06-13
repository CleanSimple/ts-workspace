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
 * @param {string} filename
 * @param {string} textContent
 * @param {string} mimeType
 * @returns {void}
 */
export function downloadFile(filename, textContent, mimeType) {
    const elem = document.createElement('a');
    elem.href = `data:${mimeType};base64,` + base64Encode(textContent);
    elem.download = filename;
    elem.style.display = 'none';
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}
/**
 * @param {string} [accept='']
 * @param {boolean} [multiple=false]
 * @returns {Promise<FileList | null>}
 */
export async function fileSelect(accept = '', multiple = false) {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.multiple = multiple;
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
