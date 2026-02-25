import baseConfig from '@cleansimple/rollup-config/userscript';
import { defineConfig } from 'rollup';

export default defineConfig({
    ...baseConfig,
    input: 'src/main.ts',
    output: [
        {
            name: 'UMS',
            format: 'iife',
            file: './dist/index.js',
        },
    ],
});
