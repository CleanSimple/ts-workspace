export function setInputValue(input: HTMLElement, value: unknown): void {
    const proto = Object.getPrototypeOf(input) as unknown;
    const valuePD = Object.getOwnPropertyDescriptor(proto, 'value');
    valuePD?.set?.call(input, value);
    input.dispatchEvent(new Event('change', { bubbles: true }));
}
