/*
These functions might be completely unnecessary, I am not sure why I needed these in the first place
*/
/**
 * get the query part of the url as an array of tuples.
 * @param {string} url
 * @returns {QueryParams}
 */
function getQueryParams(url) {
    return Array.from(new URL(url).searchParams.entries());
}
/**
 * sets the query part of the url with an array of tuples.
 * @param {string} url
 * @param {QueryParams} params
 * @returns {string}
 */
export function setQueryParams(url, params) {
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
 * @param {string} url
 * @param {string} param
 * @param {string | null} [defaultValue=null]
 * @returns {string | null}
 */
export function getQueryParam(url, param, defaultValue = null) {
    const params = new URL(url).searchParams;
    return params.has(param) ? params.get(param) : defaultValue;
}
/**
 * sets a query parameter's value and return the new url.
 * @param {string} url
 * @param {string} param
 * @param {string} value
 * @returns {string}
 */
export function setQueryParam(url, param, value) {
    const oUrl = new URL(url);
    oUrl.searchParams.set(param, value);
    return oUrl.toString();
}
/**
 * gets the current url query as an array of tuples.
 * @returns {QueryParams}
 */
export function getCurrentQueryParams() {
    return getQueryParams(window.location.href);
}
/**
 * converts an object to a url query string
 * @example
 * let params = {name: 'John', age: 30};
 * console.info(queryStringFromObject(params));
 * // output: "name=John&age=30"
 * @param {Record<string, string>} obj
 * @returns {string}
 */
export function queryStringFromObject(obj) {
    return Object.entries(obj)
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&');
}
/** @typedef {[string, string][]} QueryParams */
