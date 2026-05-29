// ==UserScript==
// @name               Sample Project
// @description        Sample Project
// @version            1.0.6
// @author             Nour Nasser <nours02345@gmail.com>
// @namespace          https://github.com/CleanSimple
// @match              https://www.google.com.eg/
// @icon               https://www.google.com/s2/favicons?sz=64&domain=google.com.eg
// ==/UserScript==

(function () {
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

    async function main() {
        // comment
        console.info('Hi!');
        await sleep(1000);
        console.info('Bye!');
    }
    void main();

})();
