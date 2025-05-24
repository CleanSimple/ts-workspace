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

    class Ref {
        _current = null;
        get current() {
            return this._current;
        }
        setCurrent(value) {
            this._current = value;
        }
    }

    const Fragment = 'Fragment';
    function createVNode(type, props = {}, children = [], isDev = false) {
        return { type, props, children, mountedHooks: [], isDev };
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
        const renderChildren = (node, children, isSvg) => children.flat().forEach(child => _render(node, child, isSvg));
        const { type, props, children } = element;
        if (typeof type === 'function') {
            try {
                const vNode = type({ ...props, children });
                _render(root, vNode, isSvgContext);
                element.mountedHooks.forEach(mountedHook => mountedHook());
            }
            finally {
            }
        }
        else if (type === Fragment) {
            // renderChildren(root, children);
            const fragment = document.createDocumentFragment();
            renderChildren(fragment, children, isSvgContext);
            root.appendChild(fragment);
        }
        else {
            const isSvg = isSvgContext || type === 'svg';
            const elem = isSvg
                ? document.createElementNS('http://www.w3.org/2000/svg', type)
                : document.createElement(type);
            if (props) {
                setProps(elem, props, isSvg);
            }
            renderChildren(elem, children, isSvg);
            root.appendChild(elem);
        }
    }
    function setProps(elem, props, isSvg) {
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'ref' && value instanceof Ref) {
                value.setCurrent(elem);
            }
            else if (key === 'style' && value instanceof Object) {
                Object.assign(elem.style, value);
            }
            else if (key === 'dataset' && value instanceof Object) {
                Object.assign(elem.dataset, value);
            }
            else if (/^on[A-Z]/.exec(key)) {
                elem.addEventListener(key.slice(2).toLowerCase(), value);
            }
            else if (hasKey(elem, key) && !isKeyReadonly(elem, key)) {
                Object.assign(elem, { [key]: value });
            }
            else {
                if (isSvg) {
                    elem.setAttributeNS(null, key, String(value));
                }
                else {
                    elem.setAttribute(key, String(value));
                }
            }
        });
    }

    function TestUI() {
        async function handleClick() {
            const self = this;
            const text = self.textContent;
            self.textContent = 'Pressed!';
            await sleep(1000);
            self.textContent = text;
        }
        return (jsx("div", { style: {
                position: 'fixed',
                left: '0px',
                top: '0px',
                zIndex: '10000',
                width: '100px',
                height: '300px',
            }, children: jsx(Fragment, { children: [jsx("button", { onClick: handleClick, children: "Button 1" }), jsx("button", { onClick: handleClick, children: "Button 2" })] }) }));
    }

    async function main() {
        // comment
        console.info('Hi!');
        await sleep(1000);
        console.info('Bye!');
        render(document.body, jsx(TestUI, {}));
    }
    void main();

})();
