class TrackingInfo {
    lastDependentId = 0;
    dependents = new Map();
}
const _TrackingMap = new WeakMap();
function registerDependent(observable, dependent) {
    let trackingInfo = _TrackingMap.get(observable);
    if (!trackingInfo) {
        trackingInfo = new TrackingInfo();
        _TrackingMap.set(observable, trackingInfo);
    }
    const id = ++trackingInfo.lastDependentId;
    trackingInfo.dependents.set(id, new WeakRef(dependent));
    return {
        unregister: () => {
            trackingInfo.dependents.delete(id);
        },
    };
}
function notifyDependents(observable) {
    const trackingInfo = _TrackingMap.get(observable);
    if (!trackingInfo)
        return;
    if (!trackingInfo.dependents.size)
        return;
    for (const [id, ref] of trackingInfo.dependents.entries()) {
        const dependent = ref.deref();
        if (dependent) {
            dependent();
        }
        else {
            trackingInfo.dependents.delete(id);
        }
    }
}

export { notifyDependents, registerDependent };
