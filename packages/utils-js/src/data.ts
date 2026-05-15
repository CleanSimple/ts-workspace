type DataRow = Record<string, unknown>;
type Mapping = Record<string, string>;

export function mapData(data: unknown[][], header: string[]): DataRow[] {
    return data.map(row =>
        Object.fromEntries(
            row.map((cell, index) => [header[index] || index, cell]),
        )
    );
}

export function unmapData(data: DataRow[], header: string[]): unknown[][] {
    return data.map(row =>
        header.map(
            colName => row[colName],
        )
    );
}

export function remapData(data: DataRow[], mapping: Mapping): DataRow[] {
    return data.map(row =>
        Object.fromEntries(
            Object.entries(row).map(
                ([key, val]) => [mapping[key] || key, val],
            ),
        )
    );
}

export function deduplicate<T>(data: T[], key?: ((item: T) => unknown) | keyof T): T[] {
    if (key === undefined) {
        return new Map(data.map(item => [item, item])).values().toArray();
    } else if (typeof key === 'string') {
        return new Map(data.map(item => [item[key], item])).values().toArray();
    } else if (typeof key === 'function') {
        return new Map(data.map(item => [key(item), item])).values().toArray();
    } else {
        throw new Error('Invalid key type');
    }
}
