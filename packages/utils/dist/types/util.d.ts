import type { ReadonlyProps } from './types';
export declare function hasKey<T extends object>(obj: T, key: PropertyKey): key is keyof T;
export declare function isKeyReadonly<T>(obj: T, key: keyof T): key is keyof ReadonlyProps<T>;
export declare function fail(error: Error): never;
export declare function rndInt(min: number, max: number): number;
export declare function base64Encode(string: string): string;
export declare function downloadFile(filename: string, textContent: string, mimeType: string): void;
export declare function fileSelect(accept?: string, multiple?: boolean): Promise<FileList | null>;
export declare function debounce<T extends (...args: never[]) => void>(func: T, timeout: number): T;
