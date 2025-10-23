import { hasKey } from '@cleansimple/utils-js';

const XMLNamespaces = {
    'svg': 'http://www.w3.org/2000/svg' as const,
    'xhtml': 'http://www.w3.org/1999/xhtml' as const,
};

export function splitNamespace(tagNS: string) {
    const [ns, tag] = tagNS.split(':', 2);
    if (!hasKey(XMLNamespaces, ns)) {
        throw new Error('Invalid namespace');
    }
    return [XMLNamespaces[ns], tag] as const;
}

export function isReadonlyProp<T>(obj: T, key: keyof T): boolean {
    let currentObj: unknown = obj;
    while (currentObj !== null) {
        const desc = Object.getOwnPropertyDescriptor(currentObj, key);
        if (desc) {
            return desc.writable === false || desc.set === undefined;
        }
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return true;
}
