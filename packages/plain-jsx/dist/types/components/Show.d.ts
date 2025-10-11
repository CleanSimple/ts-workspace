import type { Observable } from '../observable';
import type { JSXNode } from '../types';
export interface ShowProps {
    when: boolean | Observable<boolean>;
    children: JSXNode | (() => JSXNode);
}
export declare function Show(_props: ShowProps): JSXNode;
