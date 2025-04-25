import baseConfig from '@lib/rollup-config/user-script';
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
