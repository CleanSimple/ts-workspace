import type { Primitive } from './types';
export declare function hasKey<T extends object>(obj: T, key: PropertyKey): key is keyof T;
export declare function fail(error: Error): never;
export declare function rndInt(min: number, max: number): number;
export declare function base64Encode(string: string): string;
interface DownloadOptions {
    filename?: string;
    mimeType?: string;
}
export declare function download(content: string | Blob | ArrayBuffer, options?: DownloadOptions): void;
interface FileSelectOptions {
    accept?: string;
    multiple?: boolean;
}
export declare function fileSelect(options?: FileSelectOptions): Promise<FileList | null>;
export declare function debounce<T extends (...args: never[]) => void>(func: T, timeout: number): T;
export declare function isPrimitive(value: unknown): value is Primitive;
export declare function isObject(value: unknown): value is Record<string, unknown>;
export declare function extendPrototype(prototype: object, properties: object): void;
export {};
