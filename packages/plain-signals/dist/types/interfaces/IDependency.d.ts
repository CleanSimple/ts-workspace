import type { Registration } from '../types';
import type { IDependent } from './IDependent';
export declare const IDependency_registerDependent: unique symbol;
export interface IDependency {
    [IDependency_registerDependent]: (dependent: IDependent) => Registration;
}
