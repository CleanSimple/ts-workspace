var PlainJSX = (function (exports, utils) {
    'use strict';

    class Ref {
        _current = null;
        get current() {
            return this._current;
        }
        setCurrent(value) {
            this._current = value;
        }
    }
    function ref() {
        return new Ref();
    }

    const Fragment = 'Fragment';
    function createVNode(type, props = {}, children = [], isDev = false) {
        if (typeof type === 'function') {
            return type({ ...props, children });
        }
        return { type, props, children, isDev };
    }
    function createElement(tag, props, ...children) {
        return createVNode(tag, props, children);
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
            if (key === 'ref' && value instanceof Ref) {
                value.setCurrent('ass');
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
            else if (utils.hasKey(elem, key) && !utils.isKeyReadonly(elem, key)) {
                Object.assign(elem, { [key]: value });
            }
            else {
                elem.setAttribute(key, String(value));
            }
        });
    }

    exports.Fragment = Fragment;
    exports.createElement = createElement;
    exports.h = createElement;
    exports.ref = ref;
    exports.render = render;

    return exports;

})({}, Utils);
