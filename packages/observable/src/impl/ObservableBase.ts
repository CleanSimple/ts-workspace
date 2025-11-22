import type { IDependent, IHasUpdates, Observable, Observer, Subscription } from '../types';

import { DeferredUpdatesScheduler } from '../scheduling';

/**
 * Base class for observables
 * Handles subscriptions and dispatching updates
 */
export abstract class ObservableBase<T> implements Observable<T>, IHasUpdates {
    private _observers: Map<number, Observer<T>> | null = null;
    private _dependents: Map<number, WeakRef<IDependent>> | null = null;
    private _nextDependantId = 0;
    private _nextSubscriptionId = 0;
    private _prevValue: T | null = null;
    private _pendingUpdates = false;

    public registerDependent(dependant: IDependent) {
        this._dependents ??= new Map();
        const id = ++this._nextDependantId;
        this._dependents.set(id, new WeakRef(dependant));
        return {
            unsubscribe: () => {
                this._dependents!.delete(id);
            },
        };
    }

    protected notifyDependents() {
        if (!this._dependents) return;
        for (const [id, ref] of this._dependents.entries()) {
            const dependant = ref.deref();
            if (dependant) {
                dependant.onDependencyUpdated();
            }
            else {
                this._dependents.delete(id);
            }
        }
    }

    protected scheduleUpdate() {
        if (!this._observers) return;
        if (this._pendingUpdates) return;
        this._pendingUpdates = true;
        this._prevValue = this.value;
        DeferredUpdatesScheduler.schedule(this);
    }

    public flushUpdates() {
        if (!this._pendingUpdates) return;
        const prevValue = this._prevValue;
        const value = this.value;
        this._pendingUpdates = false;
        this._prevValue = null;
        if (value === prevValue) {
            return;
        }
        for (const observer of this._observers!.values()) {
            try {
                const result = observer(value);
                if (result instanceof Promise) {
                    result.catch(err => console.error(err));
                }
            }
            catch (err) {
                console.error(err);
            }
        }
    }

    public abstract get value(): T;

    public subscribe(observer: Observer<T>): Subscription {
        this._observers ??= new Map();
        const id = ++this._nextSubscriptionId;
        this._observers.set(id, observer);
        return {
            unsubscribe: () => {
                this._observers!.delete(id);
            },
        };
    }
}
