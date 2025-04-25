export declare function arrFirst<T>(arr: T[]): T;
export declare function arrFirstOr<T>(arr: T[], defaultValue?: T | null): T | null;
export declare function arrLast<T>(arr: T[]): T;
export declare function arrLastOr<T>(arr: T[], defaultValue?: T | null): T | null;
export declare function arrRemoveAt<T>(arr: T[], index: number): T;
export declare function arrInsertAt<T>(arr: T[], index: number, ...items: T[]): void;
export declare function arrRemove<T>(arr: T[], item: T): void;
