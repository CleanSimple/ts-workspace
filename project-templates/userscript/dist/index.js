// ==UserScript==
// @name         Sample Project
// @description  Sample Project
// @version      1.0.0
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
