var PlainJSX = (function (exports, utils) {
    'use strict';

    class LifecycleEvents {
        mountedHandlers = [[]];
        readyHandlers = [[]];
        renderedHandlers = [[]];
        isListening = false;
        level = 0;
        listen(node) {
            if (this.isListening) {
                throw new Error('Invalid operation. Can only listen once.');
            }
            this.isListening = true;
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode === node || addedNode.contains(node)) {
                            this.isListening = false;
                            observer.disconnect();
                            void this.mounted();
                            return;
                        }
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
        async mounted() {
            for (const handlers of this.mountedHandlers.reverse()) {
                await Promise.all(handlers.map((handler) => handler()));
            }
            setTimeout(async () => {
                for (const handlers of this.readyHandlers.reverse()) {
                    await Promise.all(handlers.map((handler) => handler()));
                }
            }, 0);
            requestAnimationFrame(() => {
                // can potentially handle onRender (before render) here!
                void Promise.resolve().then(async () => {
                    for (const handlers of this.renderedHandlers.reverse()) {
                        await Promise.all(handlers.map((handler) => handler()));
                    }
                });
            });
        }
        pushLevel() {
            this.level += 1;
            this.mountedHandlers[this.level] = this.mountedHandlers?.[this.level] ?? [];
            this.readyHandlers[this.level] = this.readyHandlers?.[this.level] ?? [];
            this.renderedHandlers[this.level] = this.renderedHandlers?.[this.level] ?? [];
        }
        popLevel() {
            this.level -= 1;
        }
        onMounted(handler) {
            this.mountedHandlers[this.level].push(handler);
        }
        onReady(handler) {
            this.readyHandlers[this.level].push(handler);
        }
        onRendered(handler) {
            this.renderedHandlers[this.level].push(handler);
        }
    }

    const XMLNamespaces = {
        'svg': 'http://www.w3.org/2000/svg',
    };
    const Fragment = 'Fragment';
    function createVNode(type, props = {}, children = [], isDev = false) {
        return { type, props, children, isDev };
    }
    function createElement(tag, props, ...children) {
        return createVNode(tag, props, children);
    }
    async function render(root, element, handlers) {
        const events = new LifecycleEvents();
        const refs = {};
        if (element && typeof element === 'object') {
            element.props['ref'] = 'default';
            events.onMounted(() => handlers.onMounted(refs.default));
        }
        const node = await renderVNode(root, element, events, refs);
        if (node === null) {
            return;
        }
        events.listen(node);
        root.appendChild(node);
    }
    async function renderVNode(root, element, events, refs) {
        if (element === undefined || element === null || typeof element === 'boolean') {
            return null;
        }
        else if (typeof element === 'string' || typeof element === 'number') {
            return document.createTextNode(String(element));
        }
        const renderChildren = async (node, children) => {
            const childNodes = await Promise.all(children.flat().map(async (child) => renderVNode(node, child, events, refs)));
            node.append(...childNodes.filter(node => node !== null));
        };
        const { type, props, children } = element;
        if (typeof type === 'function') {
            return await renderFunctionalComponent(root, type, props, children, events, refs);
        }
        else if (type === Fragment) {
            const fragment = document.createDocumentFragment();
            await renderChildren(fragment, children);
            return fragment;
        }
        else {
            const hasNS = type.includes(':');
            const domElement = hasNS
                ? document.createElementNS(...splitNamespace(type))
                : document.createElement(type);
            // handle ref prop
            if ('ref' in props && typeof props['ref'] === 'string') {
                if (refs) {
                    refs[props['ref']] = domElement;
                }
                delete props['ref'];
            }
            setProps(domElement, props);
            await renderChildren(domElement, children);
            return domElement;
        }
    }
    async function renderFunctionalComponent(root, type, props, children, events, refs) {
        const componentRefs = {};
        const utils = {
            getRef: (key) => {
                if (key in componentRefs === false) {
                    throw new Error(`Invalid ref key: ${key}`);
                }
                return componentRefs[key];
            },
            defineRef: (ref) => {
                if ('ref' in props && typeof props['ref'] === 'string') {
                    if (refs) {
                        refs[props['ref']] = ref;
                    }
                }
            },
        };
        const setupHandlers = [];
        const errorCapturedHandlers = [];
        const componentEvents = {
            onSetup: (handler) => setupHandlers.push(handler),
            onMounted: (handler) => events.onMounted(() => handler(utils)),
            onReady: (handler) => events.onReady(handler),
            onRendered: (handler) => events.onRendered(handler),
            onErrorCaptured: (handler) => errorCapturedHandlers.push(handler),
        };
        let node = null;
        events.pushLevel();
        try {
            const vNode = type({ ...props, children }, componentEvents);
            await Promise.all(setupHandlers.map((setupHandler) => setupHandler()));
            node = await renderVNode(root, vNode, events, componentRefs);
        }
        catch (error) {
            const handled = errorCapturedHandlers.some(errorCapturedHandler => errorCapturedHandler(error) === false);
            if (!handled) {
                throw error;
            }
        }
        finally {
            events.popLevel();
        }
        return node;
    }
    function setProps(elem, props) {
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'style' && value instanceof Object) {
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
                if (key.includes(':')) {
                    elem.setAttributeNS(splitNamespace(key)[0], key, String(value));
                }
                else {
                    elem.setAttribute(key, String(value));
                }
            }
        });
    }
    function splitNamespace(tagNS) {
        const [ns, tag] = tagNS.split(':', 1);
        if (!utils.hasKey(XMLNamespaces, ns)) {
            throw new Error('Invalid namespace');
        }
        return [XMLNamespaces[ns], tag];
    }

    exports.Fragment = Fragment;
    exports.createElement = createElement;
    exports.h = createElement;
    exports.render = render;

    return exports;

})({}, Utils);
