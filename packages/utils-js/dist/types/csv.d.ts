type QuoteMode = 'auto' | 'always';
interface CsvEscapeOptions {
    quoteMode?: QuoteMode;
}
export declare function csvEscape(string: string, { quoteMode }?: CsvEscapeOptions): string;
interface CsvFromArrayOptions {
    eol?: '\r' | '\n' | '\r\n';
    quoteMode?: QuoteMode;
}
export declare function csvFromArray(array: string[][], { eol, quoteMode }?: CsvFromArrayOptions): string;
interface CsvToArrayOptions {
    eol?: '\r' | '\n' | '\r\n';
}
export declare function csvToArray(csvString: string, { eol }?: CsvToArrayOptions): string[][];
export {};
