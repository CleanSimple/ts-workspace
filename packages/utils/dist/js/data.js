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
 * @param {DataRow[]} data
 * @param {string | ((row: DataRow) => unknown)} key
 * @returns {DataRow[]}
 */
export function dropDuplicates(data, key) {
    return data.filter(key instanceof Function
        ? (row1, index) => index === data.findIndex(row2 => key(row1) === key(row2))
        : (row1, index) => index === data.findIndex(row2 => row1[key] === row2[key]));
}
/** @typedef {Record<string, unknown>} DataRow */
/** @typedef {Record<string, string>} Mapping */
