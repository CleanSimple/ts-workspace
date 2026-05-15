type DataRow = Record<string, unknown>;
type Mapping = Record<string, string>;
export declare function mapData(data: unknown[][], header: string[]): DataRow[];
export declare function unmapData(data: DataRow[], header: string[]): unknown[][];
export declare function remapData(data: DataRow[], mapping: Mapping): DataRow[];
export declare function deduplicate<T>(data: T[], key?: ((item: T) => unknown) | keyof T): T[];
export {};
