import type { IDependency } from '../interfaces/IDependency';
import type { IDependent } from '../interfaces/IDependent';
import type { Observer, Registration, Subscription } from '../types';

import { IDependency_registerDependent } from '../interfaces/IDependency';
import { IDependent_onDependencyUpdated } from '../interfaces/IDependent';
import { Schedulable } from './Schedulable';

const SignalSymbol = Symbol('Signal');

export abstract class Signal<T> extends Schedulable implements IDependency {
    protected readonly [SignalSymbol] = true;
    private _lastDependentId: number = 0;
    private _lastObserverId: number = 0;
    private _dependents: Map<number, WeakRef<IDependent>> | null = null;
    private _observers: Map<number, Observer<T>> | null = null;
    private _prevValue: T | null = null;

    protected notifyDependents(): void {
        if (!this._dependents?.size) return;

        for (const [id, ref] of this._dependents.entries()) {
            const dependent = ref.deref();
            if (dependent) {
                dependent[IDependent_onDependencyUpdated]();
            }
            else {
                this._dependents.delete(id);
            }
        }
    }

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

    /* IDependency */
    public [IDependency_registerDependent](dependent: IDependent): Registration {
        const id = ++this._lastDependentId;
        this._dependents ??= new Map();
        this._dependents.set(id, new WeakRef(dependent));

        return {
            unregister: () => {
                this._dependents!.delete(id);
            },
        };
    }
}
