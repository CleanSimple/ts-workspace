/**
 * checks if a window is the top window (not an iframe)
 */
export function isTopFrame(win: Window = window): boolean {
    return win === win.parent;
}

export function isElementVisible(elem: HTMLElement): boolean {
    if (elem.offsetParent === null || elem.ariaHidden === 'true') {
        return false;
    }

    const rect = elem.getBoundingClientRect();
    if (rect.width === 0 || rect.height == 0) {
        return false;
    }

    // advanced logic to check if the element is within the document's scrollable area.
    const docElem = document.documentElement;
    const scrollableWidth = Math.max(
        docElem.scrollWidth,
        document.body.scrollWidth,
    );
    const scrollableHeight = Math.max(
        docElem.scrollHeight,
        document.body.scrollHeight,
    );

    const left = rect.left + window.pageXOffset;
    const top = rect.top + window.pageYOffset;

    return !(
        left + rect.width < 0
        || top + rect.height < 0
        || left > scrollableWidth
        || top > scrollableHeight
    );
}

/**
 * get the text content of an element excluding the text of the descendants
 */
export function getElementOwnText(elem: HTMLElement): string {
    return Array.from(elem.childNodes)
        .filter(node => node.nodeName === '#text')
        .map(node => node.nodeValue)
        .join('');
}

export function createElementFromHTML(html: string): HTMLElement | null {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    return temp.firstElementChild instanceof HTMLElement ? temp.firstElementChild : null;
}

export function createDocumentFromHTML(html: string): Document {
    const doc = document.implementation.createHTMLDocument('');
    doc.open();
    doc.write(html);
    doc.close();
    return doc;
}

interface SimulateMouseEventOptions {
    x?: number;
    y?: number;
}

export function simulateMouseEvent(
    elem: HTMLElement,
    event: string,
    { x, y }: SimulateMouseEventOptions = {},
): void {
    const rect = elem.getBoundingClientRect();
    const clientX = typeof x === 'number'
        ? x < 0 ? rect.right + x : rect.left + x
        : rect.left + rect.width / 2;
    const clientY = typeof y === 'number'
        ? y < 0 ? rect.bottom + y : rect.top + y
        : rect.top + rect.height / 2;
    elem.dispatchEvent(new MouseEvent(event, { clientX, clientY }));
}

export function queryTextNodes(root: Node) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);

    const nodes: Node[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
        nodes.push(node);
    }
    return nodes;
}
