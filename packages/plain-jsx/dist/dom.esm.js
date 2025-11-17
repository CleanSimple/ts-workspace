import { isObservable, isVal } from '@cleansimple/observable';
import { getLIS } from './lis.esm.js';
import { RefImpl, RefValue } from './ref.esm.js';
import { isObject, isReadonlyProp, splitNamespace } from './utils.esm.js';

const _Fragment = document.createDocumentFragment();
const _HandledEvents = new Map();
const InputTwoWayProps = {
    value: null,
    valueAsNumber: null,
    valueAsDate: null,
    checked: null,
    files: null,
};
const SelectTwoWayProps = {
    value: null,
    selectedIndex: null,
};
function updateChildren(parent, current, target) {
    const nCurrent = current.length;
    const nTarget = target.length;
    const newIndexMap = new Map();
    const newIndexToOldIndexMap = new Int32Array(nTarget).fill(-1);
    const nodeAfterEnd = current[nCurrent - 1].nextSibling; // `current` should never be empty, so this is safe
    let maxNewIndexSoFar = -1;
    let moved = false;
    for (let i = 0; i < nTarget; ++i) {
        newIndexMap.set(target[i], i);
    }
    const toRemove = new Array();
    for (let i = 0; i < nCurrent; ++i) {
        const oldNode = current[i];
        const newIndex = newIndexMap.get(oldNode);
        if (newIndex === undefined) {
            toRemove.push(oldNode);
        }
        else {
            newIndexToOldIndexMap[newIndex] = i;
            if (newIndex < maxNewIndexSoFar)
                moved = true;
            else
                maxNewIndexSoFar = newIndex;
        }
    }
    // remove old nodes
    if (toRemove.length) {
        _Fragment.append(...toRemove);
        _Fragment.textContent = null;
    }
    // compute longest increasing subsequence
    const lis = moved ? getLIS(newIndexToOldIndexMap) : [];
    const ops = [];
    let currentOp = null;
    let j = lis.length - 1;
    for (let i = nTarget - 1; i >= 0; --i) {
        const newNode = target[i];
        const nextPos = target.at(i + 1) ?? nodeAfterEnd;
        if (newIndexToOldIndexMap[i] === -1) {
            if (currentOp?.type === 'insert') {
                currentOp.nodes.push(newNode);
            }
            else {
                currentOp = { type: 'insert', pos: nextPos, nodes: [newNode] };
                ops.push(currentOp);
            }
            continue;
        }
        else if (moved) {
            if (j < 0 || i !== lis[j]) {
                if (currentOp?.type === 'move') {
                    currentOp.nodes.push(newNode);
                }
                else {
                    currentOp = { type: 'move', pos: nextPos, nodes: [newNode] };
                    ops.push(currentOp);
                }
                continue;
            }
            j--;
        }
        currentOp = null;
    }
    for (const op of ops) {
        // both operations are handled the same way
        if (op.pos) {
            _Fragment.append(...op.nodes.reverse());
            parent.insertBefore(_Fragment, op.pos);
        }
        else {
            parent.append(...op.nodes.reverse());
        }
    }
}
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
            if (isObservable(value)) {
                elem.classList.toggle(className, value.value);
                subscriptions.push(value.subscribe((value) => {
                    elem.classList.toggle(className, value);
                }));
            }
            else {
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
            if (isObservable(value)) {
                elem[key] = value.value;
                subscriptions.push(value.subscribe((value) => {
                    elem[key] = value;
                }));
                // two way updates for input element
                if ((elem instanceof HTMLInputElement && key in InputTwoWayProps)
                    || (elem instanceof HTMLSelectElement && key in SelectTwoWayProps)) {
                    const handler = isVal(value)
                        ? (e) => {
                            value.value = e.target[key];
                        }
                        : (e) => {
                            e.preventDefault();
                            e.target[key] = value.value;
                        };
                    elem.addEventListener('input', handler);
                    subscriptions.push({
                        unsubscribe: () => elem.removeEventListener('input', handler),
                    });
                }
            }
            else {
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

export { setProps, updateChildren };
