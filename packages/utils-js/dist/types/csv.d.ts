interface CsvEscapeOptions {
    quoteAll?: boolean;
}
export declare function csvEscape(string: string, { quoteAll }?: CsvEscapeOptions): string;
interface CsvFromArrayOptions {
    eol?: '\r' | '\n' | '\r\n';
    quoteAll?: boolean;
}
export declare function csvFromArray(array: string[][], { eol, quoteAll }?: CsvFromArrayOptions): string;
interface CsvToArrayOptions {
    eol?: '\r' | '\n' | '\r\n';
}
export declare function csvToArray(csvString: string, { eol }?: CsvToArrayOptions): string[][];
export {};
