// ==UserScript==
// @name         YouTube Save Time
// @version      2.11.0
// @description  Save the current time to the url so it's safe to navigate to other pages and return to where you left off!
// @author       Nour Nasser
// @namespace    https://github.com/Nourz1234
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @match        https://www.youtube.com/*
// @run-at       document-end
// @noframes
// ==/UserScript==
(function () {
    'use strict';

    function hasKey(obj, key) {
        return key in obj;
    }
    function isKeyReadonly(obj, key) {
        let currentObj = obj;
        while (currentObj !== null) {
            const desc = Object.getOwnPropertyDescriptor(currentObj, key);
            if (desc) {
                return desc.writable === false || desc.set === undefined;
            }
            currentObj = Object.getPrototypeOf(currentObj);
        }
        return true;
    }

    const Fragment = 'Fragment';
    function createVNode(type, props = {}, children = [], isDev = false) {
        if (typeof type === 'function') {
            return type({ ...props, children });
        }
        return { type, props, children, isDev };
    }
    function jsx(type, props) {
        let children = props.children ?? [];
        children = Array.isArray(children) ? children : [children];
        delete props.children;
        return createVNode(type, props, children, false);
    }
    function render(root, element) {
        return _render(root, element);
    }
    function _render(root, element, isSvgContext = false) {
        if (element === undefined || element === null || typeof element === 'boolean') {
            return;
        }
        else if (typeof element === 'string' || typeof element === 'number') {
            root.appendChild(document.createTextNode(String(element)));
            return;
        }
        const renderChildren = (node, children) => children.flat().forEach(child => _render(node, child, isSvgContext));
        const { type, props, children } = element;
        if (type === Fragment) {
            // renderChildren(root, children);
            const fragment = document.createDocumentFragment();
            renderChildren(fragment, children);
            root.appendChild(fragment);
            return;
        }
        const isSvg = isSvgContext || type === 'svg';
        const elem = isSvg
            ? document.createElementNS('http://www.w3.org/2000/svg', type)
            : document.createElement(type);
        if (props) {
            setProps(elem, props);
        }
        renderChildren(elem, children);
        root.appendChild(elem);
    }
    function setProps(elem, props) {
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'style' && value instanceof Object) {
                Object.assign(elem.style, value);
            }
            else if (key === 'dataset' && value instanceof Object) {
                Object.assign(elem.dataset, value);
            }
            else if (hasKey(elem, key) && !isKeyReadonly(elem, key)) {
                Object.assign(elem, { [key]: value });
            }
            else {
                elem.setAttribute(key, String(value));
            }
        });
    }

    function SaveTimeButton(props) {
        return (jsx("yt-icon-button", { id: 'guide-button', className: 'style-scope ytd-masthead', onclick: props.onclick, children: [jsx("yt-icon", { id: 'guide-icon', className: 'style-scope ytd-masthead', icon: 'yt-icons:clock' }), jsx("tp-yt-paper-tooltip", { position: 'right', offset: 0, style: { width: 'max-content' }, children: "Save Time" })] }));
    }

    const observer = new MutationObserver(onPageContentChanged);
    observer.observe(document.body, { childList: true, subtree: true });
    function saveTime() {
        const url = new URL(window.location.href);
        if (!url.toString().includes('watch?'))
            return;
        const video = document.querySelector('video');
        if (!video)
            return;
        const time = Math.floor(video.currentTime);
        const newUrl = new URL(url);
        newUrl.searchParams.set('t', `${time}s`);
        if (newUrl.toString() !== url.toString()) {
            window.history.pushState(null, '', newUrl);
        }
    }
    function onPageContentChanged() {
        addButton();
    }
    function addButton() {
        if (document.querySelector('#save-time-button-container')) {
            return;
        }
        render(document.body, jsx("div", { id: 'save-time-button-container', style: {
                position: 'fixed',
                left: '5px',
                bottom: '5px',
                borderRadius: '50%',
                backgroundColor: 'var(--yt-spec-additive-background)',
                zIndex: '100000',
            }, children: jsx(SaveTimeButton, { onclick: saveTime }) }));
    }

})();
