import type { Subscription } from '@cleansimple/plain-signals';
import type { DOMNode, PropsType } from './types';
export declare function updateChildren(parent: ParentNode, current: DOMNode[], target: DOMNode[]): void;
export declare function setProps(elem: HTMLElement, props: PropsType): Subscription[] | null;
