/**
 * @param {unknown[][]} data
 * @param {string[]} header
 * @returns {DataRow[]}
 */
export function mapData(data, header) {
    return data.map(row => Object.fromEntries(row.map((cell, index) => [header[index] || index, cell])));
}
/**
 * @param {DataRow[]} data
 * @param {string[]} header
 * @returns {unknown[][]}
 */
export function unmapData(data, header) {
    return data.map(row => header.map(colName => row[colName]));
}
/**
 * @param {DataRow[]} data
 * @param {Mapping} mapping
 * @returns {DataRow[]}
 */
export function remapData(data, mapping) {
    return data.map(row => Object.fromEntries(Object.entries(row).map(([key, val]) => [mapping[key] || key, val])));
}
/**
 * @template T
 * @param {T[]} data
 * @param {((item: T) => unknown) | keyof T} [key]
 * @returns {T[]}
 */
export function deduplicate(data, key) {
    if (key === undefined) {
        return new Map(data.map(item => [item, item])).values().toArray();
    }
    else if (typeof key === 'string') {
        return new Map(data.map(item => [item[key], item])).values().toArray();
    }
    else if (typeof key === 'function') {
        return new Map(data.map(item => [key(item), item])).values().toArray();
    }
    else {
        throw new Error('Invalid key type');
    }
}
/** @typedef {Record<string, unknown>} DataRow */
/** @typedef {Record<string, string>} Mapping */
