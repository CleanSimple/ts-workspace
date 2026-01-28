// ==UserScript==
// @name         Anti-DevTools-Detector!
// @description  Stops those pesky dev tools detectors
// @version      0.1.0
// @author       Nour Nasser
// @namespace    https://github.com/Nourz1234
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    const url = new URL(window.location.href);
    const hostname = url.hostname;
    const LogTitle = `[Anti-Devtools-Detector: ${hostname}]`;
    const log = console.log.bind(null, LogTitle);
    const info = console.info.bind(null, LogTitle);
    function heh() {
        log('heh ¬‿¬');
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
    // handle detection based on source map fetching
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
    // handle detection based on console logging
    (function (window) {
        const dummyFunc = () => {
            heh();
            // throw new Error();
        };
        const console = window.console;
        console.log = dummyFunc;
        console.debug = dummyFunc;
        console.info = dummyFunc;
        console.warn = dummyFunc;
        console.error = dummyFunc;
        console.clear = dummyFunc;
        console.table = dummyFunc;
    })(window);
    // for experimenting
    // window.addEventListener("beforeunload", (event) => {
    //     event.preventDefault();
    //     return (event.returnValue = "");
    // });
    // alert("ass");
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
