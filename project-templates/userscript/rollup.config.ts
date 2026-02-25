import baseConfig from '@cleansimple/rollup-config/userscript';
import { defineConfig } from 'rollup';

export default defineConfig({
    ...baseConfig,
    input: 'src/main.tsx',
    output: [
        {
            name: 'SampleProject',
            format: 'iife',
            file: `./dist/index.js`,
        },
    ],
});
