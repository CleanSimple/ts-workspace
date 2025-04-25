type QueryParams = [string, string][];
/**
 * sets the query part of the url with an array of tuples.
 */
export declare function setQueryParams(url: string, params: QueryParams): string;
/**
 * gets a query parameter's value from a url.
 */
export declare function getQueryParam(url: string, param: string, defaultValue?: string | null): string | null;
/**
 * sets a query parameter's value and return the new url.
 */
export declare function setQueryParam(url: string, param: string, value: string): string;
/**
 * gets the current url query as an array of tuples.
 */
export declare function getCurrentQueryParams(): QueryParams;
/**
 * converts an object to a url query string
 * @example
 * let params = {name: 'John', age: 30};
 * console.info(queryStringFromObject(params));
 * // output: "name=John&age=30"
 */
export declare function queryStringFromObject(obj: Record<string, string>): string;
export {};
