import type { HasVNode, VNode, VNodeFunctionalComponent } from './types';

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

export function mountNodes(nodes: ChildNode[]) {
    const customNodes = nodes as HasVNode<ChildNode>[];
    const n = customNodes.length;
    // handle reactive node placeholders
    if (n === 1 && customNodes[0] instanceof Comment) {
        return;
    }
    // this always gets called on children of the same parent, so it's safe to use the parent of the first node
    const parent = findParentComponent(customNodes[0].__vNode);

    if (parent) {
        for (let i = 0; i < n; i++) {
            mountVNode(customNodes[i].__vNode);
            parent.mountedChildrenCount++;
        }

        // we want to defer parent mount/unmount until all children have settled
        // we are not aware that there are other reactive nodes under the same parent that will mount/unmount in the same tick
        queueMicrotask(() => {
            if (parent.mountedChildrenCount > 0 && !parent.isMounted) {
                parent.onMount();
                signalParentComponent(parent, 'mount');
            }
        });
    }
    else {
        for (let i = 0; i < n; i++) {
            mountVNode(customNodes[i].__vNode);
        }
    }
}

export function unmountNodes(nodes: ChildNode[]) {
    const customNodes = nodes as HasVNode<ChildNode>[];
    const n = customNodes.length;
    // handle reactive node placeholders
    if (n === 1 && customNodes[0] instanceof Comment) {
        return;
    }
    // this always gets called on children of the same parent, so it's safe to use the parent of the first node
    const parent = findParentComponent(customNodes[0].__vNode);

    if (parent) {
        for (let i = 0; i < n; i++) {
            unmountVNode(customNodes[i].__vNode);
            parent.mountedChildrenCount--;
        }

        // we want to defer parent mount/unmount until all children have settled
        // we are not aware that there are other reactive nodes under the same parent that will mount/unmount in the same tick
        queueMicrotask(() => {
            if (parent.mountedChildrenCount === 0 && parent.isMounted) {
                parent.onUnmount();
                signalParentComponent(parent, 'unmount');
            }
        });
    }
    else {
        for (let i = 0; i < n; i++) {
            unmountVNode(customNodes[i].__vNode);
        }
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
        if (parentComponent) {
            parentComponent.mountedChildrenCount++;
        }
    }
    else if (vNode.type === 'text') {
        if (parentComponent) {
            parentComponent.mountedChildrenCount++;
        }
    }
    // else if (vNode.type === 'builtin') {
    //     vNode.onMount();
    // }
    // else if (vNode.type === 'observable') {
    //     vNode.onMount();
    // }
    else if (vNode.type === 'component') {
        if (vNode.mountedChildrenCount > 0 && !vNode.isMounted) {
            vNode.onMount();
            if (parentComponent) {
                parentComponent.mountedChildrenCount++;
            }
        }
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
        vNode.onUnmount();
    }
    // else if (vNode.type === 'text') {
    // }
    else if (vNode.type === 'builtin') {
        vNode.onUnmount();
    }
    else if (vNode.type === 'observable') {
        vNode.onUnmount();
    }
    else if (vNode.type === 'component') {
        vNode.onUnmount();
    }
}

function signalParentComponent(vNode: VNode, signal: 'mount' | 'unmount') {
    let parent = vNode.parent;
    while (parent) {
        if (parent.type === 'component') {
            break;
        }
        else if (parent.type === 'element') {
            return;
        }
        parent = parent.parent;
    }

    if (!parent) return;

    if (signal === 'mount') {
        parent.mountedChildrenCount++;
        queueMicrotask(() => {
            if (parent.mountedChildrenCount > 0 && !parent.isMounted) {
                parent.onMount();
                signalParentComponent(parent, 'mount');
            }
        });
    }
    else if (signal === 'unmount') {
        parent.mountedChildrenCount--;
        queueMicrotask(() => {
            if (parent.mountedChildrenCount === 0 && parent.isMounted) {
                parent.onUnmount();
                signalParentComponent(parent, 'unmount');
            }
        });
    }
}

function findParentComponent(vNode: VNode): VNodeFunctionalComponent | null {
    let parent = vNode.parent;
    while (parent) {
        if (parent.type === 'component') {
            return parent;
        }
        else if (parent.type === 'element') {
            return null;
        }
        parent = parent.parent;
    }
    return null;
}
