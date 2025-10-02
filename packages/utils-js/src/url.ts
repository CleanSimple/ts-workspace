/*
These functions might be completely unnecessary, I am not sure why I needed these in the first place
*/

type QueryParams = [string, string][];

/**
 * get the query part of the url as an array of tuples.
 */
function getQueryParams(url: string): QueryParams {
    return Array.from(new URL(url).searchParams.entries());
}

/**
 * sets the query part of the url with an array of tuples.
 */
export function setQueryParams(url: string, params: QueryParams): string {
    const oUrl = new URL(url);
    const searchParams = new URLSearchParams();
    for (const [name, value] of params) {
        searchParams.append(name, value);
    }
    oUrl.search = searchParams.toString();
    return oUrl.toString();
}

/**
 * gets a query parameter's value from a url.
 */
export function getQueryParam(
    url: string,
    param: string,
    defaultValue: string | null = null,
): string | null {
    const params = new URL(url).searchParams;
    return params.has(param) ? params.get(param) : defaultValue;
}

/**
 * sets a query parameter's value and return the new url.
 */
export function setQueryParam(url: string, param: string, value: string): string {
    const oUrl = new URL(url);
    oUrl.searchParams.set(param, value);
    return oUrl.toString();
}

/**
 * gets the current url query as an array of tuples.
 */
export function getCurrentQueryParams(): QueryParams {
    return getQueryParams(window.location.href);
}

/**
 * converts an object to a url query string
 * @example
 * let params = {name: 'John', age: 30};
 * console.info(queryStringFromObject(params));
 * // output: "name=John&age=30"
 */
export function queryStringFromObject(obj: Record<string, string>): string {
    return Object.entries(obj)
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&');
}
