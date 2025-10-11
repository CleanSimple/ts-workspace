import { type Subscription } from './observable';
import type { PropsType, VNode } from './types';
export declare function reconcileChildren(parent: ParentNode, current: ChildNode[], target: ChildNode[]): void;
export declare function patchNode(node: ChildNode, vNode: VNode): void;
export declare function setProps(elem: HTMLElement, props: PropsType): void;
export declare function observeProps(elem: HTMLElement, props: PropsType): Subscription[] | null;
