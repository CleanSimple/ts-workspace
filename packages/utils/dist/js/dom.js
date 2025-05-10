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
    if (elem.offsetParent === null || elem.ariaHidden === 'true') {
        return false;
    }
    const rect = elem.getBoundingClientRect();
    if (rect.width === 0 || rect.height == 0) {
        return false;
    }
    // advanced logic to check if the element is within the documents scrollable area.
    const docElem = document.documentElement;
    const scrollableWidth = Math.max(docElem.scrollWidth, document.body.scrollWidth);
    const scrollableHeight = Math.max(docElem.scrollHeight, document.body.scrollHeight);
    const left = rect.left + window.pageXOffset;
    const top = rect.top + window.pageYOffset;
    return !(left + rect.width < 0
        || top + rect.height < 0
        || left > scrollableWidth
        || top > scrollableHeight);
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
