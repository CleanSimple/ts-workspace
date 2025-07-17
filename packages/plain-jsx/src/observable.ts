import type { Action, AnyFunc } from '@lib/utils';
import type { FunctionalComponent } from '.';
import { nextTick } from './scheduling';

export interface Subscription {
    unsubscribe: Action;
}

export type Observer<T> = (value: T) => void;

export abstract class Observable<T> {
    public abstract get value(): T;

    public abstract subscribe(observer: Observer<T>, immediate?: boolean): Subscription;

    public computed<TComputed>(compute: (value: T) => TComputed): Observable<TComputed> {
        return new ComputedSingle(compute, this);
    }
}

/** internal use */
abstract class ObservableImpl<T> extends Observable<T> {
    protected readonly observers: Observer<T>[] = [];
    protected readonly immediateObservers: Observer<T>[] = [];
    private hasDeferredNotifications = false;
    private readonly notifyObserversCallback: typeof this.notifyObservers;

    public constructor() {
        super();
        this.notifyObserversCallback = this.notifyObservers.bind(this);
    }

    protected onUpdated() {
        if (this.immediateObservers.length) {
            const value = this.value;
            for (const observer of this.immediateObservers) {
                observer(value);
            }
        }

        if (this.observers.length) {
            if (this.hasDeferredNotifications) {
                return;
            }
            this.hasDeferredNotifications = true;
            nextTick(this.notifyObserversCallback);
        }
    }

    private notifyObservers() {
        this.hasDeferredNotifications = false;
        const value = this.value;
        for (const observer of this.observers) {
            observer(value);
        }
    }

    public override subscribe(observer: Observer<T>, immediate = true): Subscription {
        const observers = immediate ? this.immediateObservers : this.observers;
        if (!observers.includes(observer)) {
            observers.push(observer);
        }
        return {
            unsubscribe: this.unsubscribe.bind(this, observer, immediate),
        };
    }

    private unsubscribe(observer: Observer<T>, immediate: boolean) {
        const observers = immediate ? this.immediateObservers : this.observers;
        const index = observers.indexOf(observer);
        if (index > -1) {
            observers.splice(index, 1);
        }
    }
}

/**
 * Simple observable value implementation
 */
export class Val<T> extends ObservableImpl<T> {
    private _value: T;

    public constructor(initialValue: T) {
        super();
        this._value = initialValue;
    }

    public override get value() {
        return this._value;
    }

    public set value(newValue) {
        if (this._value === newValue) {
            return;
        }
        this._value = newValue;
        this.onUpdated();
    }
}

/** internal use */
class ComputedSingle<TVal, TComputed> extends Observable<TComputed> {
    private readonly observable: Observable<TVal>;
    private readonly compute: (value: TVal) => TComputed;
    private _value: TComputed;

    public constructor(compute: (value: TVal) => TComputed, observable: Observable<TVal>) {
        super();
        this.compute = compute;
        this.observable = observable;
        this._value = compute(observable.value);
    }

    public override get value(): TComputed {
        return this._value;
    }

    public override subscribe(observer: Observer<TComputed>, immediate?: boolean): Subscription {
        return this.observable.subscribe((value) => {
            this._value = this.compute(value);
            observer(this._value);
        }, immediate);
    }
}

type ObservableParameters<T extends AnyFunc, P = Parameters<T>> = {
    [K in keyof P]: Observable<P[K]>;
};

/** internal use */
class Computed<R, T extends (...args: unknown[]) => R> extends ObservableImpl<R> {
    public readonly observables: ObservableParameters<T>;
    public readonly compute: T;
    private _value: R | null;

    public constructor(compute: T, observables: ObservableParameters<T>) {
        super();
        this.compute = compute;
        this.observables = observables;
        this._value = null;

        for (const observable of observables) {
            observable.subscribe(() => {
                this._value = null;
                this.onUpdated();
            }, true);
        }
    }

    public override get value(): R {
        this._value ??= this.compute(...this.observables.map(observable => observable.value));
        return this._value;
    }
}

export function val<T>(initialValue: T) {
    return new Val<T>(initialValue);
}

export function computed<T extends AnyFunc>(
    compute: T,
    ...observables: ObservableParameters<T>
): Observable<ReturnType<T>> {
    return new Computed(compute, observables);
}

export function ref<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Element | FunctionalComponent<never, any>,
    U = T extends Element ? T : T extends FunctionalComponent<never, infer TRef> ? TRef : never,
>(): Observable<U | null> {
    return new Val<U | null>(null);
}
