import type { Action } from '@cleansimple/utils-js';
import type { FunctionalComponent } from '.';

/* types */
export interface Subscription {
    unsubscribe: Action;
}
export type Observer<T> = (value: T) => void;
export interface Observable<T> {
    get value(): T;
    subscribe: (observer: Observer<T>, instance?: object) => Subscription;
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

/* implementation */
interface INotificationSource {
    notify: () => void;
}

class NotificationScheduler {
    private static _notificationSources: INotificationSource[] = [];
    private static _scheduled: boolean = false;

    public static schedule(notificationSource: INotificationSource) {
        this._notificationSources.push(notificationSource);
        if (!this._scheduled) {
            this._scheduled = true;
            queueMicrotask(this.flush);
        }
    }

    public static flush() {
        const n = NotificationScheduler._notificationSources.length;
        for (let i = 0; i < n; ++i) {
            NotificationScheduler._notificationSources[i].notify();
        }
        NotificationScheduler._notificationSources = [];
        NotificationScheduler._scheduled = false;
    }
}

class SubscriptionImpl<T> implements Subscription {
    public readonly id: number;
    public readonly cb: Observer<T>;
    public readonly instance: object | null;
    private readonly subscriptions: Map<number, SubscriptionImpl<T>>;

    public constructor(
        id: number,
        cb: Observer<T>,
        instance: object | null,
        subscriptions: Map<number, SubscriptionImpl<T>>,
    ) {
        this.id = id;
        this.cb = cb;
        this.instance = instance;
        this.subscriptions = subscriptions;
        this.subscriptions.set(id, this);
    }

    public unsubscribe(): void {
        this.subscriptions.delete(this.id);
    }
}

interface IDependant {
    onDependencyUpdated: () => void;
}

/**
 * Base class for observables
 */
export abstract class ObservableImpl<T> implements Observable<T>, INotificationSource {
    private readonly subscriptions = new Map<number, SubscriptionImpl<T>>();
    private readonly dependents: WeakRef<IDependant>[] = [];
    private _nextSubscriptionId = 0;
    private _prevValue: T | null = null;
    private _pendingNotify = false;

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

    protected queueNotify() {
        if (this._pendingNotify) {
            return;
        }
        this._pendingNotify = true;
        this._prevValue = this.value;
        NotificationScheduler.schedule(this);
    }

    public notify() {
        if (!this._pendingNotify) {
            return;
        }
        const prevValue = this._prevValue;
        const value = this.value;
        this._pendingNotify = false;
        this._prevValue = null;
        if (value === prevValue) {
            return;
        }
        for (const subscription of this.subscriptions.values()) {
            subscription.cb.call(subscription.instance, value);
        }
    }

    public abstract get value(): T;

    public subscribe(observer: Observer<T>, instance?: object): Subscription {
        return new SubscriptionImpl(
            ++this._nextSubscriptionId,
            observer,
            instance ?? null,
            this.subscriptions,
        );
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
        this.queueNotify();
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
        this.queueNotify();
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
        this.queueNotify();
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
