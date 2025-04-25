export declare function hasKey<T extends object>(obj: T, key: PropertyKey): key is keyof T;
export declare function fail(error: Error): never;
export declare function rndInt(min: number, max: number): number;
export declare function base64Encode(string: string): string;
export declare function downloadFile(filename: string, textContent: string, mimeType: string): void;
export declare function fileSelect(accept?: string, multiple?: boolean): Promise<FileList | null>;
