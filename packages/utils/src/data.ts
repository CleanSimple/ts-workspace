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

export function dropDuplicates(
    data: DataRow[],
    key: string | ((row: DataRow) => unknown),
): DataRow[] {
    return data.filter(
        key instanceof Function
            ? (row1, index) => index === data.findIndex(row2 => key(row1) === key(row2))
            : (row1, index) => index === data.findIndex(row2 => row1[key] === row2[key]),
    );
}
