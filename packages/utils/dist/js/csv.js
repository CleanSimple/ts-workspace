/**
 * @param {string} string
 * @param {CsvEscapeOptions}
 * @returns {string}
 */
export function csvEscape(string, { quoteAll = false } = {}) {
    if (typeof string !== 'string') {
        string = String(string);
    }
    const escapeChars = [',', '"', '\r', '\n'];
    const wrapInQuotes = quoteAll ? true : escapeChars.some(x => string.includes(x));
    string = string.replaceAll('"', '""'); // escape double quotes
    return wrapInQuotes ? `"${string}"` : string;
}
/**
 * @param {string[][]} array
 * @param {CsvFromArrayOptions}
 * @returns {string}
 */
export function csvFromArray(array, { eol = '\r\n', quoteAll = false } = {}) {
    return array.map(row => row.map(cell => csvEscape(cell, { quoteAll })).join(',')).join(eol);
}
/**
 * @param {string} csvString
 * @param {CsvToArrayOptions}
 * @returns {string[][]}
 */
export function csvToArray(csvString, { eol = '\r\n' } = {}) {
    const escape = (string) => string.replaceAll(',', '<COMMA>')
        .replaceAll('\r', '<CR>')
        .replaceAll('\n', '<LF>');
    const unescape = (string) => string.replaceAll('<COMMA>', ',')
        .replaceAll('<CR>', '\r')
        .replaceAll('<LF>', '\n');
    csvString = csvString.replaceAll(/"((?:[^"]|"")*)(?:"|$)/gs, (_match, group1) => typeof group1 === 'string' ? escape(group1) : '').replaceAll('""', '"'); // unescape double quotes
    return csvString.split(eol).map(row => row.split(',').map(unescape));
}
/**
 * @typedef {Object} CsvEscapeOptions
 * @property {boolean} [quoteAll]
 */
/**
 * @typedef {Object} CsvFromArrayOptions
 * @property {'\r' | '\n' | '\r\n'} [eol]
 * @property {boolean} [quoteAll]
 */
/**
 * @typedef {Object} CsvToArrayOptions
 * @property {'\r' | '\n' | '\r\n'} [eol]
 */
