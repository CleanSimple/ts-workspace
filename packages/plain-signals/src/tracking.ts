import type { Registration } from './types';

class TrackingInfo {
    public lastDependentId: number = 0;
    public dependents = new Map<number, WeakRef<() => void>>();
}

const _TrackingMap = new WeakMap<object, TrackingInfo>();

export function registerDependent(dependency: object, dependent: () => void): Registration {
    let trackingInfo = _TrackingMap.get(dependency);
    if (!trackingInfo) {
        trackingInfo = new TrackingInfo();
        _TrackingMap.set(dependency, trackingInfo);
    }

    const id = ++trackingInfo.lastDependentId;
    trackingInfo.dependents.set(id, new WeakRef(dependent));

    return {
        unregister: () => {
            trackingInfo.dependents.delete(id);
        },
    };
}

export function notifyDependents(dependency: object): void {
    const trackingInfo = _TrackingMap.get(dependency);
    if (!trackingInfo) return;
    if (!trackingInfo.dependents.size) return;

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
