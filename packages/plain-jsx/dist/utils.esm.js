import { hasKey } from '@cleansimple/utils-js';

const XMLNamespaces = {
    'svg': 'http://www.w3.org/2000/svg',
    'xhtml': 'http://www.w3.org/1999/xhtml',
};
function splitNamespace(tagNS) {
    const [ns, tag] = tagNS.split(':', 2);
    if (!hasKey(XMLNamespaces, ns)) {
        throw new Error('Invalid namespace');
    }
    return [XMLNamespaces[ns], tag];
}

export { splitNamespace };
