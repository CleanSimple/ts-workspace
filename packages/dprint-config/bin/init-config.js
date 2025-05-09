#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const possibleConfigFilenames = ['dprint.config.js'];

async function getConfig() {
    let dir = process.cwd();

    for (const filename of possibleConfigFilenames) {
        const fullPath = path.join(dir, filename);
        try {
            await fs.access(fullPath);
        }
        catch {
            continue;
        }
        return (await import(`file://${fullPath}`)).default;
    }

    return null;
}

async function main() {
    const config = await getConfig();
    if (!config) {
        console.error("Couldn't find dprint.config.js");
        return;
    }
    await fs.writeFile("dprint.json", JSON.stringify(config, null, 4));
    console.info("Generated dprint.json successfully!");
}

main();
