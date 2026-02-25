import baseConfig from '@cleansimple/rollup-config/lib';
import { defineConfig } from 'rollup';

export default defineConfig({
    ...baseConfig,
    input: 'src/index.ts',
    output: [
        {
            format: 'esm',
            file: './dist/index.esm.js',
        },
        {
            name: 'Utils',
            format: 'iife',
            file: './dist/index.iife.js',
        },
    ],
});
