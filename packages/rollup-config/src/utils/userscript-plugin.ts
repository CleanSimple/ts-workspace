import fs from 'fs/promises';
import type { Plugin } from 'rollup';
import type { PackageJson } from '../types/types';

export function userscript(): Plugin {
    let timestamp: Date | null = null;
    let pkg: PackageJson | null = null;
    let header: string | null = null;

    return {
        name: 'userscript',
        buildStart() {
            this.addWatchFile('package.json');
        },
        async renderChunk(code: string) {
            const lastModDate = (await fs.stat('package.json')).mtime;
            if (timestamp === null || timestamp < lastModDate) {
                pkg = JSON.parse(await fs.readFile('package.json', 'utf-8')) as PackageJson;
                header = generateHeader(pkg);
                timestamp = lastModDate;
            }
            return header + code;
        },
    };
}

function generateHeader(pkg: PackageJson) {
    let header = `// ==UserScript==\n`;
    header += formatOption('name', pkg.displayName);
    header += formatOption('description', pkg.description);
    header += formatOption('version', pkg.version);
    header += formatOption('author', pkg.author);
    if (!pkg.userscript) return header;

    if (pkg.userscript.namespace) {
        header += formatOption('namespace', pkg.userscript.namespace);
    }
    if (pkg.userscript.connect) {
        header += formatOption('connect', pkg.userscript.connect);
    }
    if (pkg.userscript.match) {
        header += formatOption('match', pkg.userscript.match);
    }
    if (pkg.userscript.icon) {
        header += formatOption('icon', pkg.userscript.icon);
    }
    if (pkg.userscript['run-at']) {
        header += formatOption('run-at', pkg.userscript['run-at']);
    }
    if (pkg.userscript['run-in']) {
        header += formatOption('run-in', pkg.userscript['run-in']);
    }
    if (pkg.userscript.noframes) {
        header += '// @noframes\n';
    }
    if (pkg.userscript.grant) {
        header += formatOption('grant', pkg.userscript.grant);
    }

    header += `// ==/UserScript==\n\n`;

    return header;
}

const width = 20;

function formatOption(key: string, value: string | string[]) {
    let lines = '';
    if (Array.isArray(value)) {
        for (const item of value) {
            lines += `// @${key.padEnd(width - 2)} ${item}\n`;
        }
    }
    else {
        lines += `// @${key.padEnd(width - 2)} ${value}\n`;
    }
    return lines;
}
