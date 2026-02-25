import fs from 'fs';
import path from 'path';
// Get directory from command line arguments
const dir = process.argv[2];
if (!dir) {
    console.error('Usage: clean <directory>');
    process.exit(1);
}
const dirPath = path.resolve(dir);
clean(dirPath);
function clean(dirPath) {
    if (!fs.existsSync(dirPath)) {
        return;
    }
    const entries = fs.readdirSync(dirPath);
    for (const entry of entries) {
        const entryPath = path.join(dirPath, entry);
        const stats = fs.statSync(entryPath);
        if (stats.isDirectory()) {
            fs.rmSync(entryPath, { recursive: true, force: true });
        }
        else {
            fs.unlinkSync(entryPath);
        }
    }
}
