const EscapeChars = [',', '"', '\r', '\n'];
/**
 * @param {string} string
 * @param {CsvEscapeOptions}
 * @returns {string}
 */
export function csvEscape(string, { quoteMode = 'auto' } = {}) {
    if (typeof string !== 'string') {
        string = String(string);
    }
    const wrapInQuotes = quoteMode == 'always' ? true : EscapeChars.some(x => string.includes(x));
    if (wrapInQuotes) {
        string = string.replaceAll('"', '""'); // escape double quotes
        string = `"${string}"`;
    }
    return string;
}
/**
 * @param {string[][]} array
 * @param {CsvFromArrayOptions}
 * @returns {string}
 */
export function csvFromArray(array, { eol = '\r\n', quoteMode = 'auto' } = {}) {
    return array.map(row => row.map(cell => csvEscape(cell, { quoteMode })).join(',')).join(eol);
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
/** @typedef {'auto' | 'always'} QuoteMode */
/**
 * @typedef {Object} CsvEscapeOptions
 * @property {QuoteMode} [quoteMode]
 */
/**
 * @typedef {Object} CsvFromArrayOptions
 * @property {'\r' | '\n' | '\r\n'} [eol]
 * @property {QuoteMode} [quoteMode]
 */
/**
 * @typedef {Object} CsvToArrayOptions
 * @property {'\r' | '\n' | '\r\n'} [eol]
 */
