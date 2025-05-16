export {};
/** @typedef {() => boolean} ConditionFn */
/**
 * @typedef {(value: T) => boolean} Predicate
 * @template T
 */
/**
 * @typedef {() => T} Getter
 * @template T
 */
/**
 * @typedef {T extends void ? () => void : (arg: T) => void} Action
 * @template [T=void]
 */
/**
 * @typedef {(<T>() => T extends X ? 1 : 2) extends
 *     (<T>() => T extends Y ? 1 : 2) ? A : B} IfEquals
 * @template X
 * @template Y
 * @template A
 * @template [B=never]
 */
/**
 * @typedef {IfEquals<
 *     { [P in K]: T[P] },
 *     { -readonly [P in K]: T[P] },
 *     false,
 *     true
 * >} IsReadonly
 * @template T
 * @template {keyof T} K
 */
/**
 * @typedef {{
 *     [K in keyof T as T[K] extends (...args: never[]) => unknown ? K : never]: T[K];
 * }} MethodsOf
 * @template T
 */
/**
 * @typedef {{
 *     [K in keyof T as IsReadonly<T, K> extends true ? K : never]: T[K];
 * }} ReadonlyProps
 * @template T
 */
