import type { MethodsOf, ReadonlyProps } from '@lib/utils';
export type SupportedElements = HTMLElementTagNameMap & SVGElementTagNameMap & {
    'param': HTMLParamElement;
};
type NonReadonlyNonFunctionProps<T> = Omit<T, keyof (ReadonlyProps<T> & MethodsOf<T> & SpecialProps)>;
interface SpecialProps {
    style?: Partial<CSSStyleDeclaration>;
    dataset?: DOMStringMap;
}
interface Children {
    children?: unknown;
}
export type DOMProps<T extends Element> = Partial<NonReadonlyNonFunctionProps<T>> & SpecialProps & Children;
export type SVGProps<T extends SVGElement> = Partial<NonReadonlyNonFunctionProps<T>> & SpecialProps & Record<string, string>;
export type PropsOf<T extends Element> = T extends SVGElement ? SVGProps<T> : T extends Element ? DOMProps<T> : never;
export {};
