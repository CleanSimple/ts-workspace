import type { Action } from '@cleansimple/utils-js';
import type { FunctionalComponent } from '.';
import type { IHasUpdates } from './scheduling';

import { DeferredUpdatesScheduler } from './scheduling';

/* types */
export interface Subscription {
    unsubscribe: Action;
}
export type Observer<T> = (value: T) => void;
export interface Observable<T> {
    get value(): T;
    subscribe: (observer: Observer<T>) => Subscription;
    computed: <TComputed>(compute: (value: T) => TComputed) => Observable<TComputed>;
}
export interface Val<T> extends Observable<T> {
    set value(newValue: T);
}
export type Ref<T> = Observable<T | null>;

/* helpers */
export function val<T>(initialValue: T): Val<T> {
    return new ValImpl<T>(initialValue);
}

export function computed<T extends readonly unknown[], R>(
    observables: ObservablesOf<T>,
    compute: (...values: T) => R,
): Observable<R> {
    return new Computed(observables, compute);
}

export function ref<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Element | FunctionalComponent<never, any>,
    U = T extends Element ? T : T extends FunctionalComponent<never, infer TRef> ? TRef : never,
>(): Ref<U> {
    return new ValImpl<U | null>(null);
}

interface IDependant {
    onDependencyUpdated: () => void;
}

/**
 * Base class for observables
 */
export abstract class ObservableImpl<T> implements Observable<T>, IHasUpdates {
    private readonly subscriptions = new Map<number, Observer<T>>();
    private readonly dependents: WeakRef<IDependant>[] = [];
    private _nextSubscriptionId = 0;
    private _prevValue: T | null = null;
    private _pendingUpdates = false;

    public registerDependant(dependant: IDependant) {
        this.dependents.push(new WeakRef(dependant));
    }

    protected notifyDependents() {
        const n = this.dependents.length;
        let write = 0;
        for (let i = 0; i < n; ++i) {
            const dependant = this.dependents[i].deref();
            if (dependant) {
                dependant.onDependencyUpdated();
                this.dependents[write++] = this.dependents[i];
            }
        }
        this.dependents.length = write;
    }

    protected invalidate() {
        if (this._pendingUpdates) {
            return;
        }
        this._pendingUpdates = true;
        this._prevValue = this.value;
        DeferredUpdatesScheduler.schedule(this);
    }

    public flushUpdates() {
        if (!this._pendingUpdates) {
            return;
        }
        const prevValue = this._prevValue;
        const value = this.value;
        this._pendingUpdates = false;
        this._prevValue = null;
        if (value === prevValue) {
            return;
        }
        for (const observer of this.subscriptions.values()) {
            observer(value);
        }
    }

    public abstract get value(): T;

    public subscribe(observer: Observer<T>): Subscription {
        const id = ++this._nextSubscriptionId;
        this.subscriptions.set(id, observer);
        return {
            unsubscribe: () => {
                this.subscriptions.delete(id);
            },
        };
    }

    public computed<TComputed>(compute: (value: T) => TComputed): Observable<TComputed> {
        return new ComputedSingle(compute, this);
    }
}

/**
 * Simple observable value implementation
 */
export class ValImpl<T> extends ObservableImpl<T> {
    private _value: T;

    public constructor(initialValue: T) {
        super();
        this._value = initialValue;
    }

    public override get value() {
        return this._value;
    }

    public set value(newValue) {
        this.invalidate();
        this._value = newValue;
        this.notifyDependents();
    }
}

class ComputedSingle<TVal, TComputed> extends ObservableImpl<TComputed> implements IDependant {
    private readonly compute: (value: TVal) => TComputed;
    private readonly observable: Observable<TVal>;
    private _value: TComputed;
    private _shouldReCompute: boolean;

    public constructor(compute: (value: TVal) => TComputed, observable: Observable<TVal>) {
        super();
        this.compute = compute;
        this.observable = observable;
        this._value = this.compute(observable.value);
        this._shouldReCompute = false;

        (observable as ObservableImpl<TVal>).registerDependant(this);
    }

    public onDependencyUpdated(): void {
        this.invalidate();
        this._shouldReCompute = true;
        this.notifyDependents();
    }

    public override get value(): TComputed {
        if (this._shouldReCompute) {
            this._shouldReCompute = false;
            this._value = this.compute(this.observable.value);
        }
        return this._value;
    }
}

type ObservablesOf<T extends readonly unknown[]> = {
    [K in keyof T]: Observable<T[K]>;
};

class Computed<T extends readonly unknown[], R> extends ObservableImpl<R> implements IDependant {
    private readonly compute: (...values: T) => R;
    private readonly observables: ObservablesOf<T>;
    private _value: R;
    private _shouldReCompute: boolean;

    public constructor(observables: ObservablesOf<T>, compute: (...values: T) => R) {
        super();
        this.compute = compute;
        this.observables = observables;
        this._value = this.compute(
            ...observables.map(observable => observable.value) as unknown as T,
        );
        this._shouldReCompute = false;

        for (let i = 0; i < observables.length; ++i) {
            (observables[i] as ObservableImpl<T>).registerDependant(this);
        }
    }

    public onDependencyUpdated() {
        this.invalidate();
        this._shouldReCompute = true;
        this.notifyDependents();
    }

    public override get value(): R {
        if (this._shouldReCompute) {
            this._shouldReCompute = false;
            this._value = this.compute(
                ...this.observables.map(observable => observable.value) as unknown as T,
            );
        }
        return this._value;
    }
}
