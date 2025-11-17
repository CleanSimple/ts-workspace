export declare function splitNamespace(tagNS: string): readonly ["http://www.w3.org/2000/svg" | "http://www.w3.org/1999/xhtml", string];
export declare function isReadonlyProp<T>(obj: T, key: keyof T): boolean;
export declare function isObject(value: unknown): value is Record<string, unknown>;
