import baseConfig from '@lib/rollup-config/userscript';
import { defineConfig } from 'rollup';

export default defineConfig({
    ...baseConfig,
    input: 'src/main.ts',
    output: [
        {
            name: 'LetThereBeFullScreen',
            format: 'iife',
            file: './dist/index.js',
        },
    ],
});
