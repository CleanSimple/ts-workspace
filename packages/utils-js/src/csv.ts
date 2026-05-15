type QuoteMode = 'auto' | 'always';

interface CsvEscapeOptions {
    quoteMode?: QuoteMode;
}

const EscapeChars = [',', '"', '\r', '\n'];

export function csvEscape(string: string, { quoteMode = 'auto' }: CsvEscapeOptions = {}): string {
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

interface CsvFromArrayOptions {
    eol?: '\r' | '\n' | '\r\n';
    quoteMode?: QuoteMode;
}

export function csvFromArray(
    array: string[][],
    { eol = '\r\n', quoteMode = 'auto' }: CsvFromArrayOptions = {},
): string {
    return array.map(
        row => row.map(cell => csvEscape(cell, { quoteMode })).join(','),
    ).join(eol);
}

interface CsvToArrayOptions {
    eol?: '\r' | '\n' | '\r\n';
}

export function csvToArray(
    csvString: string,
    { eol = '\r\n' }: CsvToArrayOptions = {},
): string[][] {
    const escape = (string: string) =>
        string.replaceAll(',', '<COMMA>')
            .replaceAll('\r', '<CR>')
            .replaceAll('\n', '<LF>');
    const unescape = (string: string) =>
        string.replaceAll('<COMMA>', ',')
            .replaceAll('<CR>', '\r')
            .replaceAll('<LF>', '\n');

    csvString = csvString.replaceAll(
        /"((?:[^"]|"")*)(?:"|$)/gs,
        (_match, group1) => typeof group1 === 'string' ? escape(group1) : '',
    ).replaceAll('""', '"'); // unescape double quotes
    return csvString.split(eol).map(
        row => row.split(',').map(unescape),
    );
}
