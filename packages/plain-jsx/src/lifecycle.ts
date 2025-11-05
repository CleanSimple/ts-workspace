import type { DOMNode, HasVNode, VNode, VNodeFunctionalComponent } from './types';

import { findParentComponent } from './utils';

let _CurrentFunctionalComponent: VNodeFunctionalComponent | null = null;

export function setCurrentFunctionalComponent(component: VNodeFunctionalComponent | null) {
    _CurrentFunctionalComponent = component;
}

export function defineRef(ref: object) {
    if (!_CurrentFunctionalComponent) {
        throw new Error('defineRef can only be called inside a functional component');
    }
    _CurrentFunctionalComponent.ref = ref;
}

export function onMount(fn: VNodeFunctionalComponent['onMountCallback']) {
    if (!_CurrentFunctionalComponent) {
        throw new Error('onMount can only be called inside a functional component');
    }
    if (_CurrentFunctionalComponent.onMountCallback) {
        throw new Error('onMount can only be called once');
    }
    _CurrentFunctionalComponent.onMountCallback = fn;
}

export function onUnmount(fn: VNodeFunctionalComponent['onUnmountCallback']) {
    if (!_CurrentFunctionalComponent) {
        throw new Error('onUnmount can only be called inside a functional component');
    }
    if (_CurrentFunctionalComponent.onUnmountCallback) {
        throw new Error('onUnmount can only be called once');
    }
    _CurrentFunctionalComponent.onUnmountCallback = fn;
}

/**
 * The mounting and unmounting process is a bit complex and needs this bit of documentation
 *
 * We have 3 main groups of VNodes that represent:
 * 1. DOM Nodes ('text', 'element')
 * 2. Functional Components ('component')
 * 3. Reactive Nodes ('builtin', 'observable')
 *
 * Each of these 3 groups has a different mounting and unmounting logic.
 *
 * When is a VNode considered mounted?
 *  DOM Nodes: When they are a descendant of a connected DOM Node
 *  Functional Components: When they contain at least one DOM Node that is mounted
 *  Reactive Nodes: When they are a descendant of a connected DOM Node
 *
 *  Note: 'connected' here means the node is connected to the active DOM which is not the same as 'mounted'.
 *
 * Mounting logic:
 *  DOM Nodes: The call to mount will always mount the DOM Node and signal the closest functional component to be mounted.
 *  Functional Components: The call to mount does nothing, instead the functional component relies on mount signals from its children.
 *      Each child will give a mount signal and those are counted, when the count is greater than 0 the functional component gets mounted.
 *      Functional components will also signal parent functional components to be mounted.
 *  Reactive Nodes: The call to mount will always mount the reactive node but no signals are sent.
 *
 *  This can present an interesting situation where a functional component is not mounted, but it has reactive nodes that are mounted.
 *  Because a functional component is mounted when it has at least one DOM Node that is mounted, and a reactive node is mounted when it is a descendant of a connected DOM Node.
 *  If a mounted but empty reactive node is the only direct child of a functional component, then the functional component will not be mounted.
 *  This is a bit confusing, but it is valid.
 *
 * Unmounting logic:
 *  DOM Nodes: The call to unmount will always unmount the DOM Node and signal the closest functional component to be unmounted.
 *  Functional Components: The call to unmount does nothing, instead the functional component relies on unmount signals from its children.
 *      Each child will give an unmount signal that will decrements the count of mounted children, when the count is 0 the functional component gets unmounted.
 *      Functional components will also signal parent functional components to be unmounted.
 *  Reactive Nodes: The call to unmount will always unmount the reactive node but no signals are sent.
 */

export function mountNodes(nodes: DOMNode[]) {
    const customNodes = nodes as HasVNode<DOMNode>[];
    const n = customNodes.length;

    for (let i = 0; i < n; i++) {
        const node = customNodes[i];
        // ignore reactive node placeholders
        if (node instanceof Comment) {
            continue;
        }
        mountVNode(node.__vNode);
        findParentComponent(node.__vNode)?.mount();
    }
}

export function unmountNodes(nodes: DOMNode[]) {
    const customNodes = nodes as HasVNode<DOMNode>[];
    const n = customNodes.length;

    for (let i = 0; i < n; i++) {
        const node = customNodes[i];
        // ignore reactive node placeholders
        if (node instanceof Comment) {
            continue;
        }
        unmountVNode(node.__vNode);
        findParentComponent(node.__vNode)?.unmount(false);
    }
}

function mountVNode(vNode: VNode, parentComponent: VNodeFunctionalComponent | null = null) {
    let nextParentComponent;
    if (vNode.type === 'component') {
        nextParentComponent = vNode;
    }
    else if (vNode.type === 'element') {
        nextParentComponent = null;
    }
    else {
        nextParentComponent = parentComponent;
    }

    // mount children
    let child = vNode.firstChild;
    while (child) {
        mountVNode(child, nextParentComponent);
        child = child.next;
    }

    // mount self
    if (vNode.type === 'element') {
        parentComponent?.mount();
    }
    else if (vNode.type === 'text') {
        parentComponent?.mount();
    }
}

function unmountVNode(vNode: VNode) {
    // unmount children
    let child = vNode.firstChild;
    while (child) {
        unmountVNode(child);
        child = child.next;
    }

    // unmount self
    if (vNode.type === 'element') {
        vNode.unmount();
    }
    // else if (vNode.type === 'text') {
    // }
    else if (vNode.type === 'builtin') {
        vNode.unmount();
    }
    else if (vNode.type === 'observable') {
        vNode.unmount();
    }
    else if (vNode.type === 'component') {
        vNode.unmount(true);
    }
}
