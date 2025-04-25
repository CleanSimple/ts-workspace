/**
 * checks if a window is the top window (not an iframe)
 * @param {Window} [win=window]
 * @returns {boolean}
 */
export function isTopFrame(win = window) {
    return win === win.parent;
}
/**
 * @param {HTMLElement} elem
 * @returns {boolean}
 */
export function isElementVisible(elem) {
    return elem.offsetParent !== null;
}
/**
 * get the text content of an element excluding the text of the descendants
 * @param {HTMLElement} elem
 * @returns {string}
 */
export function getElementOwnText(elem) {
    return Array.from(elem.childNodes)
        .filter(node => node.nodeName === '#text')
        .map(node => node.nodeValue)
        .join('');
}
/**
 * @param {string} html
 * @returns {HTMLElement | null}
 */
export function createElementFromHTML(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.firstElementChild instanceof HTMLElement ? temp.firstElementChild : null;
}
/**
 * @param {string} html
 * @returns {Document}
 */
export function createDocumentFromHTML(html) {
    const doc = document.implementation.createHTMLDocument('');
    doc.open();
    doc.write(html);
    doc.close();
    return doc;
}
/**
 * @param {HTMLElement} elem
 * @param {string} event
 * @param {SimulateMouseEventOptions}
 * @returns {void}
 */
export function simulateMouseEvent(elem, event, { x, y } = {}) {
    const rect = elem.getBoundingClientRect();
    let clientX;
    let clientY;
    if (typeof x === 'number') {
        clientX = x < 0 ? rect.right + x : rect.left + x;
    }
    else {
        clientX = rect.left + rect.width / 2;
    }
    if (typeof y === 'number') {
        clientY = y < 0 ? rect.bottom + y : rect.top + y;
    }
    else {
        clientY = rect.top + rect.height / 2;
    }
    elem.dispatchEvent(new MouseEvent(event, { clientX, clientY }));
}
/**
 * @typedef {Object} SimulateMouseEventOptions
 * @property {number} [x]
 * @property {number} [y]
 */
