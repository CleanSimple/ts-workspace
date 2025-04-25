/**
 * checks if a window is the top window (not an iframe)
 */
export declare function isTopFrame(win?: Window): boolean;
export declare function isElementVisible(elem: HTMLElement): boolean;
/**
 * get the text content of an element excluding the text of the descendants
 */
export declare function getElementOwnText(elem: HTMLElement): string;
export declare function createElementFromHTML(html: string): HTMLElement | null;
export declare function createDocumentFromHTML(html: string): Document;
interface SimulateMouseEventOptions {
    x?: number;
    y?: number;
}
export declare function simulateMouseEvent(elem: HTMLElement, event: string, { x, y }?: SimulateMouseEventOptions): void;
export {};
