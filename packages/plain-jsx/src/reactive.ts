import { MultiEntryCache } from './cache';
import { patchChildren } from './domPatch';
import { Observable, type Val, val } from './observable';
import type {
    IntermediateChildren,
    IntermediateNode,
    PropsType,
    VNode,
    VNodeChildren,
} from './types';

export class ReactiveNode {
    private readonly placeholder = document.createComment('');
    private _children: IntermediateNode[] = [this.placeholder];

    public get children() {
        return this._children;
    }

    public update(rNode: IntermediateNode[] | null) {
        if (rNode === null || rNode.length === 0) { // clearing
            if (this._children[0] === this.placeholder) {
                return; // we are already cleared
            }

            rNode = [this.placeholder];
        }

        const children = resolveReactiveNodes(this._children);
        const parent = children[0].parentNode;
        if (parent) {
            const newChildren = resolveReactiveNodes(rNode);
            patchChildren(parent, children, newChildren);
        }

        this._children = rNode;
    }
}

export function resolveReactiveNodes(children: IntermediateNode[]): ChildNode[] {
    return children.flatMap((vNode) =>
        vNode instanceof ReactiveNode ? resolveReactiveNodes(vNode.children) : vNode
    );
}

export type CustomRenderFn = (
    props: PropsType,
    children: VNodeChildren,
    renderChildren: (children: VNodeChildren) => IntermediateNode[],
) => IntermediateChildren;

/* Show */
export interface ShowProps {
    when: boolean | Observable<boolean>;
    /**
     * - `true`: (default) Cache the children on the first show and re-use each time they are shown.
     * - `false`: No caching, children get rendered each time they are shown.
     */
    cache?: boolean;
    children: VNodeChildren | (() => VNode);
}

export const Show = 'Show';

export const renderShow: CustomRenderFn = (
    props: PropsType,
    children: VNodeChildren,
    renderChildren: (children: VNodeChildren) => IntermediateNode[],
): IntermediateChildren => {
    const { when, cache }: Partial<ShowProps> = props;

    const childrenOrFn: ShowProps['children'] = children;
    const getChildren = typeof childrenOrFn === 'function' ? childrenOrFn : () => childrenOrFn;

    let childNodes: IntermediateNode[] | null = null;
    const render = cache === false
        ? () => renderChildren(getChildren())
        : () => childNodes ??= renderChildren(getChildren());

    const reactiveNode = new ReactiveNode();

    if (when instanceof Observable) {
        if (when.value) {
            reactiveNode.update(render());
        }

        when.subscribe((value) => {
            reactiveNode.update(value ? render() : null);
        });
    }
    else {
        if (when) {
            reactiveNode.update(render());
        }
    }

    return reactiveNode;
};

/* For */
export interface ForProps<T> extends PropsType {
    of: Observable<T[]>;
    children: (item: T, index: Observable<number>) => VNode;
}

export function For<T>(_props: ForProps<T>): VNode {
    throw new Error(
        'This component cannot be called directly — it must be used through the render function.',
    );
}

export const renderFor: CustomRenderFn = (
    props: PropsType,
    children: VNodeChildren,
    renderChildren: (children: VNodeChildren) => IntermediateNode[],
): IntermediateChildren => {
    const { of }: Partial<ForProps<unknown>> = props;
    if (of instanceof Observable === false) {
        throw new Error("The 'of' prop on <For> is required and must be an Observable.");
    }
    if (typeof children !== 'function') {
        throw new Error(
            'The <For> component must have exactly one child — a function that maps each item.',
        );
    }
    const mapFn: ForProps<unknown>['children'] = children;

    interface CachedItem {
        index: Val<number>;
        children: IntermediateNode[];
    }

    const cache = new MultiEntryCache<CachedItem>();
    const render = (value: unknown, index: number): [unknown, CachedItem] => {
        let item = cache.get(value);
        if (item) {
            item.index.value = index;
        }
        else {
            const indexObservable = val(index);
            item = {
                index: indexObservable,
                children: renderChildren(mapFn(value, indexObservable)),
            };
        }
        return [value, item];
    };

    const reactiveNode = new ReactiveNode();

    const childNodes = of.value.map(render);
    reactiveNode.update(childNodes.flatMap(([, item]) => item.children));

    cache.clear();
    cache.addRange(childNodes);

    of.subscribe((items) => {
        const childNodes = items.map(render);
        reactiveNode.update(childNodes.flatMap(([, item]) => item.children));

        cache.clear();
        cache.addRange(childNodes);
    });

    return reactiveNode;
};
