export declare const IDependent_onDependencyUpdated: unique symbol;
export interface IDependent {
    [IDependent_onDependencyUpdated]: () => void;
}
