export declare abstract class Schedulable {
    private _isScheduled;
    protected schedule(): void;
    protected abstract onSchedule(): void;
    protected abstract onDispatch(): void;
    private static _pendingItems;
    private static _cyclicScheduleCount;
    protected static version: number;
    private static flush;
}
