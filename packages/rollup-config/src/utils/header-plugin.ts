import fs from 'fs/promises';
import type { Plugin } from 'rollup';

interface PluginOptions {
    path: string;
}

export function header(options: PluginOptions): Plugin {
    let timestamp: Date | null = null;
    let fileContent: string | null = null;

    return {
        name: 'header',
        async renderChunk(code: string) {
            const lastModDate = (await fs.stat(options.path)).mtime;
            if (timestamp === null || timestamp < lastModDate) {
                fileContent = await fs.readFile(options.path, 'utf-8');
                timestamp = lastModDate;
            }
            return fileContent + code;
        },
    };
}
