// ==UserScript==
// @name               Anti-DevTools Detector!
// @description        Stops those pesky dev tools detectors
// @version            0.3.0
// @author             Nour Nasser <nours02345@gmail.com>
// @namespace          https://github.com/CleanSimple
// @match              *://*/*
// @run-at             document-start
// @grant              none
// ==/UserScript==

(function () {
    'use strict';

    const url = new URL(window.location.href);
    const hostname = url.hostname;
    const LogTitle = `[Anti-Devtools-Detector: ${hostname}]`;
    const log = console.log.bind(null, LogTitle);
    const info = console.info.bind(null, LogTitle);
    function heh() {
        const stack = new Error().stack;
        log('heh ¬‿¬', stack);
    }

    (function (window) {
        window.heh = heh;
    })(window);

    info('Starting...');
    // handle detection that lives in window.devtoolsDetector
    (function () {
        const fakeDevtoolsDetector = {
            addListener: () => { },
            launch: () => {
                heh();
            },
        };
        Object.defineProperty(window, 'devtoolsDetector', {
            get: () => fakeDevtoolsDetector,
            set: (_value) => { },
            configurable: false,
        });
    })();
    // handle detection that is based on source map loading
    (function () {
        // Why is it possible to have a document with a null body? That I can't fathom. ¯\_(ツ)_/¯
        if (!document.body)
            return;
        const realAppendChild = document.body.appendChild.bind(document.body);
        document.body.appendChild = function (child) {
            if (child instanceof HTMLScriptElement) {
                // info("Script content:", child.innerHTML);
                // TODO: Maybe auto detect these!
                if (child.innerHTML == '//# sourceMappingURL=/app.js.map') {
                    child.innerHTML = 'heh()';
                }
            }
            return realAppendChild(child);
        };
    })();
    // handle detection that is based on console logging
    (function (window) {
        const validateInput = (...args) => {
            if (args.length === 1 && args[0]) {
                const value = args[0];
                if (Object.prototype.hasOwnProperty.call(value, 'toString')) {
                    if (value instanceof Date) {
                        info('Intercepted date to string detection.');
                        return false;
                    }
                    else if (value instanceof RegExp) {
                        info('Intercepted regex to string detection.');
                        return false;
                    }
                    else if (typeof value === 'function') {
                        info('Intercepted function to string detection.');
                        return false;
                    }
                }
                if (value instanceof Element && Object.prototype.hasOwnProperty.call(value, 'id')) {
                    info('Intercepted element define id detection.');
                    return false;
                }
            }
            return true;
        };
        const console = window.console;
        const realLog = console.log.bind(null);
        const realWarn = console.warn.bind(null);
        const realInfo = console.info.bind(null);
        console.log = (...args) => {
            if (!validateInput(...args))
                return;
            realLog(...args);
        };
        console.info = (...args) => {
            if (!validateInput(...args))
                return;
            realInfo(...args);
        };
        console.warn = (...args) => {
            if (!validateInput(...args))
                return;
            realWarn(...args);
        };
        console.clear = () => {
            info('Intercepted console.clear().');
        };
        console.table = () => {
            info('Intercepted console.table().');
        };
    })(window);
    // handle detection timers
    (function (window) {
        const realSetInterval = window.setInterval.bind(null);
        // To prevent breakage we create fake interval.
        // The long timeout is meant to improve performance, although I am not really sure that it does
        const fakeInterval = () => realSetInterval(() => { }, 24 * 60 * 60 * 1000);
        window.setInterval = (handler, timeout, ...args) => {
            const handlerSource = handler.toString();
            if (handlerSource.includes('.detect(')) {
                info('Intercepted detection timer.');
                return fakeInterval();
            }
            return realSetInterval(handler, timeout, ...args);
        };
    })(window);
    // handle detection that is based on inner vs outer window size comparison
    (function (window) {
        Object.defineProperty(window, 'outerWidth', {
            configurable: false,
            get: function () {
                return window.innerWidth;
            },
        });
        Object.defineProperty(window, 'outerHeight', {
            configurable: false,
            get: function () {
                return window.innerHeight;
            },
        });
    })(window);
    // for experimenting
    // window.addEventListener("beforeunload", (event) => {
    //     event.preventDefault();
    //     return (event.returnValue = "");
    // });
    // function onChange(mutationList, observer) {
    //     for (let mutation of mutationList) {
    //         console.log(logTitle, "Mutation:", mutation);
    //     }
    // }
    // const observer = new MutationObserver(onChange);
    // observer.observe(document.documentElement, {childList: true, subtree: true, attributes: true});
    // Object.defineProperty(window.document, "body", {
    //     get: function() {
    //         return bodyProxy;
    //     }
    // });

})();
