import '@cleansimple/plain-signals';
import { RefImpl, RefValue } from './ref.esm.js';
import { isObject, isReadonlyProp, splitNamespace } from './utils.esm.js';

document.createDocumentFragment();
const _HandledEvents = new Map();
function setProps(elem, props) {
    const subscriptions = [];
    // handle class prop early so it doesn't overwrite class:* props
    if ('class' in props) {
        elem.className = props['class'];
    }
    for (const key in props) {
        if (key === 'class' || key === 'children') {
            continue;
        }
        const value = props[key];
        if (key === 'ref') {
            if (value instanceof RefImpl) {
                value[RefValue] = elem;
                subscriptions.push({
                    unsubscribe: () => {
                        value[RefValue] = null;
                    },
                });
            }
        }
        else if (key === 'style') {
            if (isObject(value)) {
                Object.assign(elem.style, value);
            }
            else if (typeof value === 'string') {
                elem.setAttribute('style', value);
            }
            else {
                throw new Error("Invalid value type for 'style' prop.");
            }
        }
        else if (key === 'dataset') {
            if (!isObject(value)) {
                throw new Error('Dataset value must be an object');
            }
            Object.assign(elem.dataset, value);
        }
        else if (key.startsWith('class:')) {
            const className = key.slice(6);
            {
                elem.classList.toggle(className, value);
            }
        }
        else if (key.startsWith('on:')) {
            const event = key.slice(3);
            let eventKey = _HandledEvents.get(event);
            if (!eventKey) {
                eventKey = Symbol(event);
                _HandledEvents.set(event, eventKey);
                document.addEventListener(event, globalEventHandler);
            }
            elem[eventKey] = value;
        }
        else if (key in elem && !isReadonlyProp(elem, key)) {
            {
                elem[key] = value;
            }
        }
        else {
            if (key.includes(':')) {
                elem.setAttributeNS(splitNamespace(key)[0], key, value);
            }
            else {
                elem.setAttribute(key, value);
            }
        }
    }
    return subscriptions.length === 0 ? null : subscriptions;
}
function globalEventHandler(evt) {
    const key = _HandledEvents.get(evt.type);
    let node = evt.target;
    while (node) {
        const handler = node[key];
        if (handler) {
            return handler.call(node, evt);
        }
        node = node.parentNode;
    }
}

export { setProps };
