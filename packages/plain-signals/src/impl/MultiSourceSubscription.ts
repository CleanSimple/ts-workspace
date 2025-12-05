import type { IDependent } from '../interfaces/IDependent';
import type { Registration, SignalsOf, Subscription } from '../types';

import { Schedulable } from '../abstract/Schedulable';
import { IDependency_registerDependent } from '../interfaces/IDependency';
import { IDependent_onDependencyUpdated } from '../interfaces/IDependent';

export class MultiSourceSubscription<T extends readonly unknown[]> extends Schedulable
    implements Subscription, IDependent
{
    private readonly _signals: SignalsOf<T>;
    private readonly _observer: (...values: T) => void;
    private readonly _registrations: Registration[];

    public constructor(signals: SignalsOf<T>, observer: (...values: T) => void) {
        super();
        this._signals = signals;
        this._observer = observer;
        this._registrations = [];

        for (let i = 0; i < signals.length; ++i) {
            this._registrations.push(
                signals[i][IDependency_registerDependent](this),
            );
        }
    }

    protected override onSchedule(): void {/* empty */}

    protected override onDispatch(): void {
        this._observer(...this._signals.map(signal => signal.value) as unknown as T);
    }

    public unsubscribe() {
        for (let i = 0; i < this._registrations.length; ++i) {
            this._registrations[i].unregister();
        }
    }

    /* IDependent */
    public [IDependent_onDependencyUpdated]() {
        this.schedule();
    }
}
