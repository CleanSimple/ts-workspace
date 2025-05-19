import type { MethodsOf, ReadonlyProps } from '@lib/utils';
export type SupportedElements = HTMLElementTagNameMap & SVGElementTagNameMap;
interface SpecialProps {
    style?: Partial<CSSStyleDeclaration>;
    dataset?: DOMStringMap;
}
interface Children {
    children?: unknown;
}
type SettableProps<T> = Omit<T, keyof (ReadonlyProps<T> & MethodsOf<T> & SpecialProps)>;
export type DOMProps<T extends Element> = Partial<SettableProps<T>> & SpecialProps & Children;
export type SVGProps<T extends SVGElement> = Partial<SettableProps<T>> & SpecialProps & Record<string, string>;
export type PropsOf<T extends Element> = T extends SVGElement ? SVGProps<T> : T extends Element ? DOMProps<T> : never;
export interface VNodeElement {
    type: string;
    props: object | undefined;
    children: VNode[];
    isDev: boolean;
}
export type VNode = VNodeElement | string | number | boolean | null | undefined;
export type VNodeChildren = VNode | VNode[];
export type FunctionalComponent = (props: object) => VNode;
export {};
