export declare class MultiEntryCache<T> {
    private readonly map;
    private readonly readIndex;
    constructor(entries?: [unknown, T][]);
    add(key: unknown, value: T): void;
    get(key: unknown): T | undefined;
    reset(): void;
    clear(): void;
}
