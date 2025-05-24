import baseConfig from '@lib/rollup-config/userscript';

export default {
    ...baseConfig,
    input: 'src/main.tsx',
    output: [
        {
            name: 'UMS',
            format: 'iife',
            file: './dist/index.js',
        },
    ],
};
