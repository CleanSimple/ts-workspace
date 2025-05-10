// ==UserScript==
// @name         Let there be fullscreen!
// @description  Adds a full screen button to your iframes! (Because the web is complex and sometimes your fullscreen button doesn't work.)
// @version      0.2.0
// @author       Nour Nasser
// @namespace    https://github.com/Nourz1234
// @match        *://*/*
// @grant        GM_addStyle
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
    const observer = new MutationObserver(debounce(addButton, 1000));
    observer.observe(document.body, { childList: true, subtree: true });
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
            .filter(iframe => iframe.offsetParent !== null)
            .filter(iframe => iframe.ariaHidden !== 'true')
            .forEach(iframe => {
            iframe.insertAdjacentElement('afterend', createFullScreenButtonForIframe(iframe));
            iframe.dataset['canFullscreen'] = 'true';
        });
    }

})();
