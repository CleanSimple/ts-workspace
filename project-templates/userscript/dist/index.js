// ==UserScript==
// @name         Sample Project
// @description  Sample Project
// @version      1.0.0
// @match        https://www.google.com.eg/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com.eg
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    async function sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    async function main() {
        // comment
        console.info('Hi!');
        await sleep(1000);
        console.info('Bye!');
    }
    void main();

})();
