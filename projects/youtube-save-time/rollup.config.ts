import baseConfig from '@cleansimple/rollup-config/userscript';
import { defineConfig } from 'rollup';

export default defineConfig({
    ...baseConfig,
    input: 'src/main.tsx',
    output: [
        {
            name: 'YouTubeSaveTime',
            format: 'iife',
            file: `./dist/index.js`,
        },
    ],
});
