var Utils = (function (exports) {
    'use strict';

    Array.prototype.first = function () {
        return this[0];
    };
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
    Array.prototype.insertAt = function (index, ...items) {
        return this.splice(index, 0, ...items);
    };
    Array.prototype.removeAt = function (index) {
        return this.splice(index, 1)[0];
    };
    Array.prototype.remove = function (item) {
        const index = this.indexOf(item);
        if (index !== -1) {
            this.splice(index, 1);
        }
    };

    async function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    async function waitUntil(condition, { timeoutMs = 0, intervalMs = 100 } = {}) {
        const startTime = new Date();
        while (!condition()) {
            if (timeoutMs > 0) {
                const elapsed = Date.now() - startTime.getTime();
                if (elapsed > timeoutMs)
                    return false;
            }
            await sleep(intervalMs);
        }
        return true;
    }
    async function poll(getter, predicate, { timeoutMs = 0, intervalMs = 100 } = {}) {
        const startTime = new Date();
        let value;
        while (!predicate(value = getter())) {
            if (timeoutMs > 0) {
                const elapsed = Date.now() - startTime.getTime();
                if (elapsed > timeoutMs)
                    return null;
            }
            await sleep(intervalMs);
        }
        return value;
    }

    function csvEscape(string, { quoteAll = false } = {}) {
        if (typeof string !== 'string') {
            string = String(string);
        }
        const escapeChars = [',', '"', '\r', '\n'];
        const wrapInQuotes = quoteAll ? true : escapeChars.some(x => string.includes(x));
        string = string.replaceAll('"', '""'); // escape double quotes
        return wrapInQuotes ? `"${string}"` : string;
    }
    function csvFromArray(array, { eol = '\r\n', quoteAll = false } = {}) {
        return array.map(row => row.map(cell => csvEscape(cell, { quoteAll })).join(',')).join(eol);
    }
    function csvToArray(csvString, { eol = '\r\n' } = {}) {
        const escape = (string) => string.replaceAll(',', '<COMMA>')
            .replaceAll('\r', '<CR>')
            .replaceAll('\n', '<LF>');
        const unescape = (string) => string.replaceAll('<COMMA>', ',')
            .replaceAll('<CR>', '\r')
            .replaceAll('<LF>', '\n');
        csvString = csvString.replaceAll(/"((?:[^"]|"")*)(?:"|$)/gs, (_match, group1) => typeof group1 === 'string' ? escape(group1) : '').replaceAll('""', '"'); // unescape double quotes
        return csvString.split(eol).map(row => row.split(',').map(unescape));
    }

    function mapData(data, header) {
        return data.map(row => Object.fromEntries(row.map((cell, index) => [header[index] || index, cell])));
    }
    function unmapData(data, header) {
        return data.map(row => header.map(colName => row[colName]));
    }
    function remapData(data, mapping) {
        return data.map(row => Object.fromEntries(Object.entries(row).map(([key, val]) => [mapping[key] || key, val])));
    }
    function dropDuplicates(data, key) {
        return data.filter(key instanceof Function
            ? (row1, index) => index === data.findIndex(row2 => key(row1) === key(row2))
            : (row1, index) => index === data.findIndex(row2 => row1[key] === row2[key]));
    }

    /**
     * checks if a window is the top window (not an iframe)
     */
    function isTopFrame(win = window) {
        return win === win.parent;
    }
    function isElementVisible(elem) {
        if (elem.offsetParent === null || elem.ariaHidden === 'true') {
            return false;
        }
        const rect = elem.getBoundingClientRect();
        if (rect.width === 0 || rect.height == 0) {
            return false;
        }
        // advanced logic to check if the element is within the document's scrollable area.
        const docElem = document.documentElement;
        const scrollableWidth = Math.max(docElem.scrollWidth, document.body.scrollWidth);
        const scrollableHeight = Math.max(docElem.scrollHeight, document.body.scrollHeight);
        const left = rect.left + window.pageXOffset;
        const top = rect.top + window.pageYOffset;
        return !(left + rect.width < 0
            || top + rect.height < 0
            || left > scrollableWidth
            || top > scrollableHeight);
    }
    /**
     * get the text content of an element excluding the text of the descendants
     */
    function getElementOwnText(elem) {
        return Array.from(elem.childNodes)
            .filter(node => node.nodeName === '#text')
            .map(node => node.nodeValue)
            .join('');
    }
    function createElementFromHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.firstElementChild instanceof HTMLElement ? temp.firstElementChild : null;
    }
    function createDocumentFromHTML(html) {
        const doc = document.implementation.createHTMLDocument('');
        doc.open();
        doc.write(html);
        doc.close();
        return doc;
    }
    function simulateMouseEvent(elem, event, { x, y } = {}) {
        const rect = elem.getBoundingClientRect();
        const clientX = typeof x === 'number'
            ? x < 0 ? rect.right + x : rect.left + x
            : rect.left + rect.width / 2;
        const clientY = typeof y === 'number'
            ? y < 0 ? rect.bottom + y : rect.top + y
            : rect.top + rect.height / 2;
        elem.dispatchEvent(new MouseEvent(event, { clientX, clientY }));
    }

    async function convertImageToJpg(blob) {
        return new Promise((resolve, reject) => {
            const imageUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(imageUrl);
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
                    canvas.toBlob(resolve, 'image/jpg', 1);
                }
                else {
                    reject(new Error('Failed to get 2d canvas context'));
                }
            };
            img.src = imageUrl;
        });
    }

    /**
     * returns a new date with a number of days added to it
     */
    function dateAddDays(date, days) {
        const newDate = new Date();
        newDate.setTime(date.getTime() + (days * (24 * 60 * 60 * 1000)));
        return newDate;
    }
    /**
     * returns a new date with a number of days subtracted from it
     */
    function dateSubDays(date, days) {
        return dateAddDays(date, -days);
    }
    /**
     * returns a new date with a number of minutes added to it
     */
    function dateAddMinutes(date, minutes) {
        const newDate = new Date();
        newDate.setTime(date.getTime() + (minutes * (60 * 1000)));
        return newDate;
    }
    /**
     * returns a new date with a number of minutes subtracted from it
     */
    function dateSubMinutes(date, minutes) {
        return dateAddMinutes(date, -minutes);
    }
    const LOCALE = 'en-GB';
    function dateToString(date) {
        return date.toLocaleString(LOCALE, { dateStyle: 'short', timeStyle: 'short' });
    }
    function dateToTimeString(date) {
        return date.toLocaleTimeString(LOCALE, { timeStyle: 'short' });
    }
    function dateToDateString(date) {
        return date.toLocaleString(LOCALE, { dateStyle: 'short' });
    }
    function dateToWeekDay(date) {
        return date.toLocaleString(LOCALE, { weekday: 'long' });
    }
    /**
     * returns the timezone offset at the provided date accounting for daylight savings
     * @example
     * console.info(getTimezoneOffset("Africa/Cairo", new Date()));
     * // prints +0200 (No DST) or +0300 (DST)
     */
    function getTimezoneOffset(timeZone, date) {
        function padded(num) {
            const sign = num < 0 ? '-' : '+';
            return sign + Math.abs(num).toString().padStart(4, '0');
        }
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
        return padded(Math.round((tzDate.getTime() - utcDate.getTime()) / 6e4 / 60 * 100));
    }
    function getToday() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    /*
    These functions might be completely unnecessary, I am not sure why I needed these in the first place
    */
    /**
     * get the query part of the url as an array of tuples.
     */
    function getQueryParams(url) {
        return Array.from(new URL(url).searchParams.entries());
    }
    /**
     * sets the query part of the url with an array of tuples.
     */
    function setQueryParams(url, params) {
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
    function getQueryParam(url, param, defaultValue = null) {
        const params = new URL(url).searchParams;
        return params.has(param) ? params.get(param) : defaultValue;
    }
    /**
     * sets a query parameter's value and return the new url.
     */
    function setQueryParam(url, param, value) {
        const oUrl = new URL(url);
        oUrl.searchParams.set(param, value);
        return oUrl.toString();
    }
    /**
     * gets the current url query as an array of tuples.
     */
    function getCurrentQueryParams() {
        return getQueryParams(window.location.href);
    }
    /**
     * converts an object to a url query string
     * @example
     * let params = {name: 'John', age: 30};
     * console.info(queryStringFromObject(params));
     * // output: "name=John&age=30"
     */
    function queryStringFromObject(obj) {
        return Object.entries(obj)
            .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
            .join('&');
    }

    function hasKey(obj, key) {
        return key in obj;
    }
    function fail(error) {
        throw error;
    }
    function rndInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function base64Encode(string) {
        const bytes = new TextEncoder().encode(string);
        const binaryString = Array.from(bytes)
            .map(byte => String.fromCharCode(byte))
            .join('');
        return window.btoa(binaryString);
    }
    function downloadText(filename, content, mimeType) {
        const elem = document.createElement('a');
        elem.href = `data:${mimeType};base64,` + base64Encode(content);
        elem.download = filename;
        elem.style.display = 'none';
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
    function downloadBlob(filename, content, mimeType) {
        const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
        const elem = document.createElement('a');
        elem.href = url;
        elem.download = filename;
        elem.style.display = 'none';
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
        URL.revokeObjectURL(url);
    }
    function downloadArrayBuffer(filename, content, mimeType) {
        const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
        const elem = document.createElement('a');
        elem.href = url;
        elem.download = filename;
        elem.style.display = 'none';
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
        URL.revokeObjectURL(url);
    }
    async function fileSelect(accept = '', multiple = false) {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            input.multiple = multiple;
            const onFileSelect = () => {
                window.removeEventListener('focus', onFileSelect);
                setTimeout(() => {
                    resolve(input.files);
                }, 1000);
            };
            window.addEventListener('focus', onFileSelect);
            input.click();
        });
    }
    function debounce(func, timeout) {
        let timeoutId = 0;
        return ((...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(func, timeout, ...args);
        });
    }
    function isPrimitive(value) {
        return (value === null
            || (typeof value !== 'object' && typeof value !== 'function'));
    }
    function isObject(value) {
        return typeof value === 'object'
            && value !== null
            && Object.getPrototypeOf(value) === Object.prototype;
    }

    function setInputValue(input, value) {
        const proto = Object.getPrototypeOf(input);
        const valuePD = Object.getOwnPropertyDescriptor(proto, 'value');
        valuePD?.set?.call(input, value);
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const ReactAutomation = {
        setInputValue,
    };

    exports.ReactAutomation = ReactAutomation;
    exports.base64Encode = base64Encode;
    exports.convertImageToJpg = convertImageToJpg;
    exports.createDocumentFromHTML = createDocumentFromHTML;
    exports.createElementFromHTML = createElementFromHTML;
    exports.csvEscape = csvEscape;
    exports.csvFromArray = csvFromArray;
    exports.csvToArray = csvToArray;
    exports.dateAddDays = dateAddDays;
    exports.dateAddMinutes = dateAddMinutes;
    exports.dateSubDays = dateSubDays;
    exports.dateSubMinutes = dateSubMinutes;
    exports.dateToDateString = dateToDateString;
    exports.dateToString = dateToString;
    exports.dateToTimeString = dateToTimeString;
    exports.dateToWeekDay = dateToWeekDay;
    exports.debounce = debounce;
    exports.downloadArrayBuffer = downloadArrayBuffer;
    exports.downloadBlob = downloadBlob;
    exports.downloadText = downloadText;
    exports.dropDuplicates = dropDuplicates;
    exports.fail = fail;
    exports.fileSelect = fileSelect;
    exports.getCurrentQueryParams = getCurrentQueryParams;
    exports.getElementOwnText = getElementOwnText;
    exports.getQueryParam = getQueryParam;
    exports.getTimezoneOffset = getTimezoneOffset;
    exports.getToday = getToday;
    exports.hasKey = hasKey;
    exports.isElementVisible = isElementVisible;
    exports.isObject = isObject;
    exports.isPrimitive = isPrimitive;
    exports.isTopFrame = isTopFrame;
    exports.mapData = mapData;
    exports.poll = poll;
    exports.queryStringFromObject = queryStringFromObject;
    exports.remapData = remapData;
    exports.rndInt = rndInt;
    exports.setQueryParam = setQueryParam;
    exports.setQueryParams = setQueryParams;
    exports.simulateMouseEvent = simulateMouseEvent;
    exports.sleep = sleep;
    exports.unmapData = unmapData;
    exports.waitUntil = waitUntil;

    return exports;

})({});
