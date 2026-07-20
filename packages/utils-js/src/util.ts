import type { Primitive } from './types';

export function hasKey<T extends object>(obj: T, key: PropertyKey): key is keyof T {
    return key in obj;
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

interface DownloadOptions {
    filename?: string;
    mimeType?: string;
}

export function download(
    content: string | Blob | ArrayBuffer,
    options: DownloadOptions = {},
): void {
    const downloadUrl = URL.createObjectURL(
        new Blob([content], options.mimeType ? { type: options.mimeType } : {}),
    );
    const elem = document.createElement('a');

    elem.href = downloadUrl;
    elem.download = options.filename ?? '';
    elem.style.display = 'none';

    elem.click();

    URL.revokeObjectURL(downloadUrl);
}

interface FileSelectOptions {
    accept?: string;
    multiple?: boolean;
}

export async function fileSelect(options: FileSelectOptions = {}): Promise<FileList | null> {
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

export function debounce<T extends (...args: never[]) => void>(func: T, timeout: number): T {
    let timeoutId = 0;
    return ((...args: Parameters<typeof func>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, timeout, ...args);
    }) as T;
}

export function isPrimitive(value: unknown): value is Primitive {
    return (
        value === null
        || (typeof value !== 'object' && typeof value !== 'function')
    );
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object'
        && value !== null
        && Object.getPrototypeOf(value) === Object.prototype;
}

export function extendPrototype(prototype: object, properties: object) {
    for (const propertyName of Object.getOwnPropertyNames(properties)) {
        const desc = Object.getOwnPropertyDescriptor(properties, propertyName)!;
        desc.enumerable = false;
        Object.defineProperty(prototype, propertyName, desc);
    }
}
