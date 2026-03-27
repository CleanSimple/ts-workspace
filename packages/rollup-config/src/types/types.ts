export interface PackageJson {
    name: string;
    displayName: string;
    description: string;
    version: string;
    author: string | {
        name: string;
        email: string;
        url: string;
    };
    license?: string;
    userscript?: {
        icon?: string;
        namespace?: string;
        'run-at'?:
            | 'document-start'
            | 'document-body'
            | 'document-end'
            | 'document-idle'
            | 'context-menu';
        'run-in'?: 'normal-tabs' | 'incognito-tabs' | `container-id-${number}`;
        noframes?: boolean;
        connect?: string | string[];
        match?: string | string[];
        grant?: string | string[];
        updateURL?: string;
        downloadURL?: string;
        supportURL?: string;
    };
}
