export declare abstract class DeferredNotifier {
    private _isScheduled;
    protected scheduleNotification(): void;
    protected abstract onScheduleNotification(): void;
    protected abstract onDispatchNotification(): void;
    private static _scheduledNotifiers;
    private static dispatchNotifications;
}
