import type { Registration } from '../types';
import type { IDependent } from './IDependent';

export const IDependency_registerDependent = Symbol('IDependency_registerDependent');

export interface IDependency {
    [IDependency_registerDependent]: (dependent: IDependent) => Registration;
}
