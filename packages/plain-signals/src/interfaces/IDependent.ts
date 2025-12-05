export const IDependent_onDependencyUpdated = Symbol('IDependent_onDependencyUpdated');

export interface IDependent {
    [IDependent_onDependencyUpdated]: () => void;
}
