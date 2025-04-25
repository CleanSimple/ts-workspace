import { defineConfig } from 'rollup';
import baseConfig from '@lib/rollup-config/lib';

export default defineConfig({
    ...baseConfig,
    input: 'src/index.ts',
    output: [
        {
            format: 'esm',
            file: './dist/bundle/index.esm.js',
        },
        {
            name: 'Utils',
            format: 'iife',
            file: './dist/bundle/index.iife.js',
        },
    ],
});
