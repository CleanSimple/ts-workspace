import type { Observable } from '../observable';
import type { JSXNode } from '../types';

/* Show */
export interface ShowProps {
    when: boolean | Observable<boolean>;
    children: JSXNode | (() => JSXNode);
}

export function Show(_props: ShowProps): JSXNode {
    throw new Error(
        'This component cannot be called directly — it must be used through the render function.',
    );
}
