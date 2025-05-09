import baseConfig from '@lib/rollup-config/userscript';

export default {
    ...baseConfig,
    input: 'src/main.ts',
    output: [
        {
            name: 'UMS',
            format: 'iife',
            file: './dist/index.js',
        },
    ],
};
