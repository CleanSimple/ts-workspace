import type { Observer, Subscription } from '../types';

import { Observable } from '../abstract/Observable';

/**
 * Base class for observables
 * Handles subscriptions and dispatching updates
 */
export abstract class ObservableBase<T> extends Observable<T> {
    private _lastObserverId: number = 0;
    private _observers: Map<number, Observer<T>> | null = null;
    private _prevValue: T | null = null;

    protected override onScheduleNotification(): void {
        this._prevValue = this.value;
    }

    protected override onDispatchNotification(): void {
        const prevValue = this._prevValue;
        this._prevValue = null;
        if (!this._observers?.size) return;

        const value = this.value;
        if (value === prevValue) return;

        for (const observer of this._observers.values()) {
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

    public override subscribe(observer: Observer<T>): Subscription {
        const id = ++this._lastObserverId;
        this._observers ??= new Map();
        this._observers.set(id, observer);

        return {
            unsubscribe: () => {
                this._observers!.delete(id);
            },
        };
    }
}
