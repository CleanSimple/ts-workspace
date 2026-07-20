// ==UserScript==
// @name               Let there be fullscreen!
// @description        Adds a full screen button to your iframes! (Because the web is complex and sometimes your fullscreen button doesn't work.)
// @version            0.3.3
// @author             Nour Nasser <nours02345@gmail.com>
// @namespace          https://github.com/CleanSimple
// @match              *://*/*
// @run-at             document-start
// @grant              GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    function debounce(func, timeout) {
        let timeoutId = 0;
        return ((...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(func, timeout, ...args);
        });
    }
    function extendPrototype(prototype, properties) {
        for (const propertyName of Object.getOwnPropertyNames(properties)) {
            if (propertyName === 'constructor') {
                continue;
            }
            const desc = Object.getOwnPropertyDescriptor(properties, propertyName);
            desc.enumerable = false;
            Object.defineProperty(prototype, propertyName, desc);
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

    GM_addStyle(`
.ltbf-btn {
  all: unset;
  position: absolute;
  top: 0;
  left: 0;
  margin: 5px;
  padding: 5px;
  border: 1px solid gray;
  border-radius: 5px;
  color: white;
  background: blue;
  z-index: 10000;
}`);
    const Magic = 'let-there-be-fullscreen';
    const observer = new MutationObserver(debounce(addButton, 1000));
    observer.observe(document.body, { childList: true, subtree: true });
    if (isTopFrame()) {
        document.addEventListener('fullscreenchange', () => {
            const isFullscreen = document.fullscreenElement !== null;
            broadcastMessage(window, {
                magic: Magic,
                name: 'fullscreen',
                value: isFullscreen,
            });
        });
    }
    window.addEventListener('message', event => {
        if (!isFullscreenEvent(event.data)) {
            return;
        }
        onFullscreenChange(event.data.value);
    });
    function isFullscreenEvent(value) {
        return (value != null && typeof value === 'object' && 'magic' in value
            && value.magic === Magic && 'name' in value && value.name === 'fullscreen');
    }
    function onFullscreenChange(isFullscreen) {
        document.querySelectorAll('.ltbf-btn').forEach(button => {
            button.style.display = isFullscreen ? 'none' : 'block';
        });
    }
    function createFullScreenButtonForIframe(iframe) {
        const button = document.createElement('button');
        button.textContent = 'Fullscreen!';
        button.className = 'ltbf-btn';
        button.addEventListener('click', () => {
            makeFullscreen(iframe);
        });
        return button;
    }
    function makeFullscreen(iframe) {
        void iframe.requestFullscreen();
    }
    function addButton() {
        Array.from(document.querySelectorAll('iframe'))
            .filter(iframe => iframe.dataset['canFullscreen'] !== 'true')
            .filter(iframe => isElementVisible(iframe))
            .forEach(iframe => {
            iframe.insertAdjacentElement('afterend', createFullScreenButtonForIframe(iframe));
            iframe.dataset['canFullscreen'] = 'true';
        });
    }
    function broadcastMessage(win, message, targetOrigin = '*') {
        win.postMessage(message, targetOrigin);
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < win.frames.length; i++) {
            broadcastMessage(win.frames[i], message, targetOrigin);
        }
    }

})();
