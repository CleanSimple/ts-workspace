const XMLNamespaces = {
    'svg': 'http://www.w3.org/2000/svg',
    'xhtml': 'http://www.w3.org/1999/xhtml',
};
function splitNamespace(tagNS) {
    const [ns, tag] = tagNS.split(':', 2);
    if (ns in XMLNamespaces) {
        return [XMLNamespaces[ns], tag];
    }
    else {
        throw new Error('Invalid namespace');
    }
}
function isReadonlyProp(obj, key) {
    let currentObj = obj;
    while (currentObj !== null) {
        const desc = Object.getOwnPropertyDescriptor(currentObj, key);
        if (desc) {
            return desc.writable === false || desc.set === undefined;
        }
        currentObj = Object.getPrototypeOf(currentObj);
    }
    return true;
}
function isObject(value) {
    return typeof value === 'object'
        && value !== null
        && Object.getPrototypeOf(value) === Object.prototype;
}

export { isObject, isReadonlyProp, splitNamespace };
