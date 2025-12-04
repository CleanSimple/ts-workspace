import type { Registration } from './types';
export declare function registerDependent(dependency: object, dependent: () => void): Registration;
export declare function notifyDependents(dependency: object): void;
