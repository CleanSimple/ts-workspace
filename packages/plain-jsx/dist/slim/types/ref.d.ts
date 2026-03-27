import { FunctionalComponent } from './types.js';

type ElementOrComponent = Element | FunctionalComponent<never, any>;
interface Ref<T extends object> {
    get current(): T | null;
}
type RefFor<T extends ElementOrComponent> = Ref<T extends FunctionalComponent<never, infer TRef> ? TRef : T>;
declare function ref<T extends ElementOrComponent>(): RefFor<T>;

export { ref };
export type { Ref };
