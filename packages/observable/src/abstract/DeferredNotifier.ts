export abstract class DeferredNotifier {
    private _isScheduled: boolean = false;

    protected scheduleNotification() {
        if (this._isScheduled) return;
        this._isScheduled = true;

        this.onScheduleNotification();

        DeferredNotifier._scheduledNotifiers.push(this);
        if (DeferredNotifier._scheduledNotifiers.length === 1) {
            queueMicrotask(DeferredNotifier.dispatchNotifications);
        }
    }

    protected abstract onScheduleNotification(): void;

    protected abstract onDispatchNotification(): void;

    /* static members */
    private static _scheduledNotifiers: DeferredNotifier[] = [];
    private static _nestedUpdates: number = 0;

    private static dispatchNotifications(this: void) {
        const notifiers = DeferredNotifier._scheduledNotifiers;
        DeferredNotifier._scheduledNotifiers = [];

        const n = notifiers.length;
        for (let i = 0; i < n; ++i) {
            const notifier = notifiers[i];
            notifier._isScheduled = false;
            notifier.onDispatchNotification();
        }

        // detect cyclic updates
        if (DeferredNotifier._scheduledNotifiers.length > 0) {
            DeferredNotifier._nestedUpdates++;
            if (DeferredNotifier._nestedUpdates >= 100) {
                // break cyclic updates to avoid starving the event loop
                DeferredNotifier._scheduledNotifiers = [];
                throw new Error('Too many nested updates');
            }
        }
        else {
            DeferredNotifier._nestedUpdates = 0;
        }
    }
}
