import type { Observer, Subscription } from '../types';

import { Schedulable } from './Schedulable';

const ObservableSymbol = Symbol('Observable');

export abstract class Observable<T> extends Schedulable {
    protected readonly [ObservableSymbol] = true;
    private _lastObserverId: number = 0;
    private _observers: Map<number, Observer<T>> | null = null;
    private _prevValue: T | null = null;

    protected override onSchedule(): void {
        this._prevValue = this.value;
    }

    protected override onDispatch(): void {
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

    public abstract get value(): T;

    public subscribe(observer: Observer<T>): Subscription {
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
