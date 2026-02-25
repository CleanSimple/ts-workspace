import fs from 'fs/promises';
export function header(options) {
    let timestamp = null;
    let fileContent = null;
    return {
        name: 'header',
        async renderChunk(code) {
            const lastModDate = (await fs.stat(options.path)).mtime;
            if (timestamp === null || timestamp < lastModDate) {
                fileContent = await fs.readFile(options.path, 'utf-8');
                timestamp = lastModDate;
            }
            return fileContent + code;
        },
    };
}
