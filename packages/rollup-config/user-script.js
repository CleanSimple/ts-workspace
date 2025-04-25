import fs from 'fs/promises';
import { defineConfig } from 'rollup';
import { header } from 'rollup-plugin-header';
import baseConfig from './base.js';

export default defineConfig({
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        header({ header: await fs.readFile('./header.js') }),
    ],
});
