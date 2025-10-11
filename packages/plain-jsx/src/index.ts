import type { MaybePromise, Setter } from '@cleansimple/utils-js';
import type { Observable } from './observable';
import type { JSXNode } from './types';

export { For } from './components/For';
export { Show } from './components/Show';
export { Fragment, type JSX, render } from './core';
export { computed, type Observable, type Ref, ref, type Val, val } from './observable';
export { nextTick } from './scheduling';

export interface Helpers<TRef> {
    /**
     * A helper function to define the component's ref interface.
     * @example
     * const Counter = () => {
     *      const count = createObservable<number>(0);
     *      const increment = () => count.value += 1;
     *      // this object will be exposed via the ref keyword of this component
     *      defineRef({ increment });
     *      return <button onClick={increment}>Count is {count}</button>;
     * };
     */
    defineRef: Setter<TRef>;
    onMount: (handler: () => MaybePromise<void>) => void;
    onUnmount: (handler: () => MaybePromise<void>) => void;
}

export type FunctionalComponent<TProps = object, TRef = unknown> = (
    props: TProps & { ref?: Observable<TRef | null> },
    helpers: Helpers<TRef>,
) => JSXNode;

/** To be extended for components with children */
export interface ParentComponent {
    children?: JSXNode;
}
