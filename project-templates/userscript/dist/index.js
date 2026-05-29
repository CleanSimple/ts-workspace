// ==UserScript==
// @name               Sample Project
// @description        Sample Project
// @version            1.0.7
// @author             Nour Nasser <nours02345@gmail.com>
// @namespace          https://github.com/CleanSimple
// @match              https://www.google.com.eg/
// @icon               https://www.google.com/s2/favicons?sz=64&domain=google.com.eg
// ==/UserScript==

(function () {
    'use strict';

    function extendPrototype(prototype, properties) {
        for (const key of Object.keys(properties)) {
            const desc = Object.getOwnPropertyDescriptor(properties, key);
            desc.enumerable = false;
            Object.defineProperty(prototype, key, desc);
        }
    }

    const arrayExtensions = () => ({
        first() {
            return this[0];
        },
        last() {
            return this[this.length - 1];
        },
        insertAt(index, ...items) {
            return this.splice(index, 0, ...items);
        },
        removeAt(index) {
            return this.splice(index, 1)[0];
        },
        remove(item) {
            const index = this.indexOf(item);
            if (index !== -1) {
                this.splice(index, 1);
            }
        },
    });
    extendPrototype(Array.prototype, arrayExtensions());

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
