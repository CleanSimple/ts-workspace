import type { Observable } from './abstract/Observable';
import type { Registration } from './types';
export declare function registerDependent(observable: Observable<unknown>, dependent: () => void): Registration;
export declare function notifyDependents(observable: Observable<unknown>): void;
