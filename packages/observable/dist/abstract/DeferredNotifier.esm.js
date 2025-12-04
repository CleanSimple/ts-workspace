class DeferredNotifier {
    _isScheduled = false;
    scheduleNotification() {
        if (this._isScheduled)
            return;
        this._isScheduled = true;
        this.onScheduleNotification();
        DeferredNotifier._scheduledNotifiers.push(this);
        if (DeferredNotifier._scheduledNotifiers.length === 1) {
            queueMicrotask(DeferredNotifier.dispatchNotifications);
        }
    }
    /* static members */
    static _scheduledNotifiers = [];
    static dispatchNotifications() {
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

export { DeferredNotifier };
