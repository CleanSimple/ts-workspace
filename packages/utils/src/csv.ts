interface CsvEscapeOptions {
    quoteAll?: boolean;
}

export function csvEscape(string: string, { quoteAll = false }: CsvEscapeOptions = {}): string {
    if (typeof string !== 'string') {
        string = String(string);
    }

    const escapeChars = [',', '"', '\r', '\n'];

    const wrapInQuotes = quoteAll ? true : escapeChars.some(x => string.includes(x));

    string = string.replaceAll('"', '""'); // escape double quotes
    return wrapInQuotes ? `"${string}"` : string;
}

interface CsvFromArrayOptions {
    eol?: '\r' | '\n' | '\r\n';
    quoteAll?: boolean;
}

export function csvFromArray(
    array: string[][],
    { eol = '\r\n', quoteAll = false }: CsvFromArrayOptions = {},
): string {
    return array.map(
        row => row.map(cell => csvEscape(cell, { quoteAll })).join(','),
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
