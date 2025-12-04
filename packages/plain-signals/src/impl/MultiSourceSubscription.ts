import type { Registration, SignalsOf, Subscription } from '../types';

import { Schedulable } from '../abstract/Schedulable';
import { registerDependent } from '../tracking';

export class MultiSourceSubscription<T extends readonly unknown[]> extends Schedulable
    implements Subscription
{
    private readonly _signals: SignalsOf<T>;
    private readonly _observer: (...values: T) => void;
    private readonly _dependencyUpdatedCallback: () => void;
    private readonly _registrations: Registration[];

    public constructor(signals: SignalsOf<T>, observer: (...values: T) => void) {
        super();
        this._signals = signals;
        this._observer = observer;
        this._registrations = [];

        this._dependencyUpdatedCallback = () => this.schedule();

        for (let i = 0; i < signals.length; ++i) {
            this._registrations.push(
                registerDependent(signals[i], this._dependencyUpdatedCallback),
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
}
