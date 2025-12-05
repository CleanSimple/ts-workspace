class Schedulable {
    _isScheduled = false;
    schedule() {
        if (Schedulable._cyclicScheduleCount >= 100) {
            // break the cycle to avoid starving the event loop
            throw new Error('Too many nested updates');
        }
        if (this._isScheduled)
            return;
        this._isScheduled = true;
        this.onSchedule();
        Schedulable._pendingItems.push(this);
        if (Schedulable._pendingItems.length === 1) {
            queueMicrotask(Schedulable.flush);
        }
    }
    /* static members */
    static _pendingItems = [];
    static _cyclicScheduleCount = 0;
    static flush() {
        const items = Schedulable._pendingItems;
        Schedulable._pendingItems = [];
        const n = items.length;
        for (let i = n - 1; i >= 0; --i) {
            const item = items[i];
            try {
                item.onDispatch();
            }
            catch (e) {
                console.error(e);
            }
            item._isScheduled = false;
        }
        // track cyclic scheduling
        if (Schedulable._pendingItems.length > 0) {
            Schedulable._cyclicScheduleCount++;
        }
        else {
            Schedulable._cyclicScheduleCount = 0;
        }
    }
}

export { Schedulable };
