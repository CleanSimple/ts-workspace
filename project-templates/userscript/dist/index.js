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
    function jsx(type, props) {
        let children = props.children ?? [];
        children = Array.isArray(children) ? children : [children];
        delete props.children;
        return createVNode(type, props, children, false);
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
            else if (hasKey(elem, key) && !isKeyReadonly(elem, key)) {
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
        if (!hasKey(XMLNamespaces, ns)) {
            throw new Error('Invalid namespace');
        }
        return [XMLNamespaces[ns], tag];
    }

    const TestCounter = ({ initialValue: initialCount = 1 }, { onMounted }) => {
        let count = initialCount;
        let countElem;
        const setCount = (newCount) => {
            count = newCount;
            countElem.textContent = count.toString();
        };
        const increment = () => setCount(count + 1);
        const decrement = () => setCount(count - 1);
        onMounted(({ getRef, defineRef }) => {
            countElem = getRef('count');
            defineRef({
                increment,
                decrement,
                get count() {
                    return count;
                },
            });
        });
        return jsx("span", { ref: 'count', children: count });
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const TestSpan = (props, { onMounted }) => {
        // onMounted(({ defineRef }) => {
        //     defineRef({}); // should be invalid
        // });
        return jsx("span", { children: "Test span" });
    };

    const TestUI = ({ uId = '1-1' }, { onMounted }) => {
        let counter;
        onMounted(({ getRef, defineRef }) => {
            counter = getRef('counter');
            // should throw since TestSpan does not define a ref type
            // const span = getRef<typeof TestSpan>('span');
            defineRef({
                get count() {
                    return counter.count;
                },
            });
        });
        return (jsx("div", { style: {
                position: 'fixed',
                display: 'flex',
                flexDirection: 'column',
                left: '0px',
                top: '0px',
                zIndex: '10000',
                width: '100px',
                height: '300px',
            }, children: jsx(Fragment, { children: [uId, jsx(TestCounter, { ref: 'counter' }), jsx("button", { onClick: () => counter.increment(), children: "Increment" }), jsx("button", { onClick: () => counter.decrement(), children: "Decrement" }), jsx("button", { onClick: () => alert(counter.count), children: "Show count" }), jsx(TestSpan, { ref: 'span' })] }) }));
    };

    async function main() {
        // comment
        console.info('Hi!');
        await sleep(1000);
        console.info('Bye!');
        async function onMounted(ref) {
            await sleep(1000);
            console.info('count', ref?.count);
        }
        void render(document.body, jsx(TestUI, {}), { onMounted });
    }
    void main();

})();
