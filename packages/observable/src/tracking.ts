import type { Observable } from './abstract/Observable';
import type { Registration } from './types';

class TrackingInfo {
    public lastDependentId: number = 0;
    public dependents = new Map<number, WeakRef<() => void>>();
}

const _TrackingMap = new WeakMap<Observable<unknown>, TrackingInfo>();

export function registerDependent(
    observable: Observable<unknown>,
    dependent: () => void,
): Registration {
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

export function notifyDependents(observable: Observable<unknown>): void {
    const trackingInfo = _TrackingMap.get(observable);
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
