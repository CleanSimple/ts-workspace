export abstract class Schedulable {
    private _isScheduled: boolean = false;

    protected schedule() {
        if (this._isScheduled) return;
        this._isScheduled = true;

        this.onSchedule();

        Schedulable._pendingItems.push(this);
        if (Schedulable._pendingItems.length === 1) {
            queueMicrotask(Schedulable.flush);
        }
    }

    protected abstract onSchedule(): void;

    protected abstract onDispatch(): void;

    /* static members */
    private static _pendingItems: Schedulable[] = [];
    private static _cyclicScheduleCount: number = 0;

    private static flush(this: void) {
        const items = Schedulable._pendingItems;
        Schedulable._pendingItems = [];

        const n = items.length;
        for (let i = 0; i < n; ++i) {
            const item = items[i];
            item._isScheduled = false;
            item.onDispatch();
        }

        // detect cyclic scheduling
        if (Schedulable._pendingItems.length > 0) {
            Schedulable._cyclicScheduleCount++;
            if (Schedulable._cyclicScheduleCount >= 100) {
                // break the cycle to avoid starving the event loop
                Schedulable._pendingItems = [];
                throw new Error('Too many nested updates');
            }
        }
        else {
            Schedulable._cyclicScheduleCount = 0;
        }
    }
}
