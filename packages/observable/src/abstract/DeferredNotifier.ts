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

    private static dispatchNotifications(this: void) {
        const notifiers = DeferredNotifier._scheduledNotifiers;
        DeferredNotifier._scheduledNotifiers = [];

        const n = notifiers.length;
        for (let i = 0; i < n; ++i) {
            const notifier = notifiers[i];
            notifier._isScheduled = false;
            notifier.onDispatchNotification();
        }
    }
}
