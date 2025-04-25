/**
 * @param {HTMLElement} input
 * @param {unknown} value
 * @returns {void}
 */
export function setInputValue(input, value) {
    const proto = Object.getPrototypeOf(input);
    const valuePD = Object.getOwnPropertyDescriptor(proto, 'value');
    valuePD?.set?.call(input, value);
    input.dispatchEvent(new Event('change', { bubbles: true }));
}
