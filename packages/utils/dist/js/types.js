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
 * @typedef {(value: T) => void} Setter
 * @template T
 */
/**
 * @typedef {T extends void ? () => void : (arg: T) => void} Action
 * @template [T=void]
 */
/**
 * @typedef {T | Promise<T>} MaybePromise
 * @template T
 */
/**
 * @typedef {T extends readonly (infer TElem)[]
 *     ? TElem
 *     : never} ArrayElementType
 * @template {readonly unknown[]} T
 */
/** @typedef {(...args: any[]) => any} AnyFunc */
/** @typedef {string | number | boolean | bigint | symbol | null | undefined} Primitive */
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
 * Note: Does not match setters/getters
 * @typedef {{
 *     [K in keyof T as T[K] extends AnyFunc ? K : never]: T[K];
 * }} MethodsOf
 * @template T
 */
/**
 * Note: Does not match setter-only properties
 * @typedef {{
 *     [K in keyof T as IsReadonly<T, K> extends true ? K : never]: T[K];
 * }} ReadonlyProps
 * @template T
 */
