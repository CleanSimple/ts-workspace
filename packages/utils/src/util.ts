import type { ReadonlyProps } from './types';

export function hasKey<T extends object>(obj: T, key: PropertyKey): key is keyof T {
    return key in obj;
}

export function isKeyReadonly<T>(obj: T, key: keyof T): key is keyof ReadonlyProps<T> {
    let currentObj: unknown = obj;
    while (currentObj !== null) {
        const desc = Object.getOwnPropertyDescriptor(currentObj, key);
        if (desc) {
            return desc.writable === false || desc.set === undefined;
        }
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return true;
}

export function fail(error: Error): never {
    throw error;
}

export function rndInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function base64Encode(string: string): string {
    const bytes = new TextEncoder().encode(string);
    const binaryString = Array.from(bytes)
        .map(byte => String.fromCharCode(byte))
        .join('');
    return window.btoa(binaryString);
}

export function downloadFile(filename: string, textContent: string, mimeType: string): void {
    const elem = document.createElement('a');
    elem.href = `data:${mimeType};base64,` + base64Encode(textContent);
    elem.download = filename;
    elem.style.display = 'none';

    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

export async function fileSelect(accept = '', multiple = false): Promise<FileList | null> {
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

export function debounce<T extends (...args: never[]) => void>(func: T, timeout: number): T {
    let timeoutId = 0;
    return ((...args: Parameters<typeof func>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, timeout, ...args);
    }) as T;
}
