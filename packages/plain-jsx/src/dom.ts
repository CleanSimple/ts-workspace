import { hasKey, isObject } from '@cleansimple/utils-js';
import { mountNodes, unmountNodes } from './lifecycle-events';
import { getLIS } from './lis';
import { ObservableImpl, type Subscription, ValImpl } from './observable';
import type { HasVNode, PropsType, VNode } from './types';
import { isReadonlyProp, splitNamespace } from './utils';

const _Fragment = document.createDocumentFragment();
const _HandledEvents = new Map<string, symbol>();

const InputTwoWayProps = {
    value: null,
    valueAsNumber: null,
    valueAsDate: null,
    checked: null,
    files: null,
} as const;
const SelectTwoWayProps = {
    value: null,
    selectedIndex: null,
} as const;

export function reconcileChildren(parent: ParentNode, current: ChildNode[], target: ChildNode[]) {
    const newIndexMap = new Map<ChildNode, number>();
    const nTarget = target.length;
    const nCurrent = current.length;
    for (let i = 0; i < nTarget; ++i) {
        newIndexMap.set(target[i], i);
    }
    const newIndexToOldIndexMap = new Int32Array(nTarget).fill(-1);
    const nodeAfterEnd = current[nCurrent - 1].nextSibling; // `current` should never be empty, so this is safe
    let maxNewIndexSoFar = -1;
    let moved = false;

    const toRemove = new Array<ChildNode>();
    for (let i = 0; i < nCurrent; ++i) {
        const oldNode = current[i];
        const newIndex = newIndexMap.get(oldNode);
        if (newIndex === undefined) {
            toRemove.push(oldNode);
        } else {
            newIndexToOldIndexMap[newIndex] = i;
            if (newIndex < maxNewIndexSoFar) moved = true;
            else maxNewIndexSoFar = newIndex;
        }
    }

    // remove old nodes
    if (toRemove.length) {
        unmountNodes(toRemove);
        _Fragment.append(...toRemove);
        _Fragment.textContent = null;
    }

    // compute longest increasing subsequence
    const lis = moved ? getLIS(newIndexToOldIndexMap) : [];

    interface Op {
        type: 'insert' | 'move';
        pos: ChildNode | null;
        nodes: ChildNode[];
    }
    const ops: Op[] = [];
    let currentOp: Op | null = null;

    let j = lis.length - 1;
    for (let i = nTarget - 1; i >= 0; --i) {
        const newNode = target[i];
        const nextPos = target.at(i + 1) ?? nodeAfterEnd;

        if (newIndexToOldIndexMap[i] === -1) {
            if (currentOp?.type === 'insert') {
                currentOp.nodes.push(newNode);
            } else {
                currentOp = { type: 'insert', pos: nextPos, nodes: [newNode] };
                ops.push(currentOp);
            }
            continue;
        } else if (moved) {
            if (j < 0 || i !== lis[j]) {
                if (currentOp?.type === 'move') {
                    currentOp.nodes.push(newNode);
                } else {
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

        if (op.type === 'insert') {
            mountNodes(op.nodes);
        }
    }
}

export function patchNode(node: ChildNode, vNode: VNode) {
    (node as HasVNode<ChildNode>).__vNode = vNode;
}

export function setProps(elem: HTMLElement, props: PropsType) {
    // handle class prop early so it doesn't overwrite class:* props
    if ('class' in props) {
        elem.className = props['class'] as string;
    }

    for (const key in props) {
        if (key === 'ref' || key === 'class' || key === 'children') {
            continue;
        }

        const value = props[key];

        if (key === 'style') {
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
            const active = (value instanceof ObservableImpl ? value.value : value) as boolean;
            if (active) {
                elem.classList.add(className);
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
            (elem as unknown as Record<symbol, unknown>)[eventKey] = value;
        }
        else if (hasKey(elem, key) && !isReadonlyProp(elem, key)) {
            (elem as unknown as Record<string, unknown>)[key] = value instanceof ObservableImpl
                ? value.value
                : value;
        }
        else {
            if (key.includes(':')) {
                elem.setAttributeNS(splitNamespace(key)[0], key, value as string);
            }
            else {
                elem.setAttribute(key, value as string);
            }
        }
    }
}

export function observeProps(
    elem: HTMLElement,
    props: PropsType,
): Subscription[] | null {
    const subscriptions: Subscription[] = [];
    for (const key in props) {
        if (key === 'children') {
            continue;
        }

        const value = props[key];
        if (value instanceof ObservableImpl === false) {
            continue;
        }

        if (key === 'ref') {
            if (value instanceof ValImpl) {
                value.value = elem;
                subscriptions.push({
                    unsubscribe: () => {
                        value.value = null;
                    },
                });
            }
        }
        if (key.startsWith('class:')) {
            const className = key.slice(6);
            const setValue = (value: boolean) => {
                if (value) {
                    elem.classList.add(className);
                }
                else {
                    elem.classList.remove(className);
                }
            };

            subscriptions.push(value.subscribe(setValue));
        }
        else if (hasKey(elem, key)) {
            const setValue = (value: unknown) => {
                (elem as unknown as Record<string, unknown>)[key] = value;
            };

            subscriptions.push(value.subscribe(setValue));

            // two way updates for input element
            if (
                (elem instanceof HTMLInputElement && key in InputTwoWayProps)
                || (elem instanceof HTMLSelectElement && key in SelectTwoWayProps)
            ) {
                if (value instanceof ValImpl) {
                    const handler = (e: Event) => {
                        value.value = (e.target as HTMLInputElement)[key];
                    };
                    elem.addEventListener('change', handler);
                    subscriptions.push({
                        unsubscribe: () => elem.removeEventListener('change', handler),
                    });
                }
                else {
                    const handler = (e: Event) => {
                        e.preventDefault();
                        (e.target as unknown as Record<string, unknown>)[key] = value.value;
                    };
                    elem.addEventListener('change', handler);
                    subscriptions.push({
                        unsubscribe: () => elem.removeEventListener('change', handler),
                    });
                }
            }
        }
    }

    return subscriptions.length === 0 ? null : subscriptions;
}

function globalEventHandler(evt: Event) {
    const key = _HandledEvents.get(evt.type)!;

    type NodeType = Node & { [key]?: EventListener } | null;

    let node: NodeType = evt.target as NodeType;
    while (node) {
        const handler = node[key];
        if (handler) {
            return handler.call(node, evt);
        }
        node = node.parentNode as NodeType;
    }
}
