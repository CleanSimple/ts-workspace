import baseConfig from '@lib/rollup-config/lib';

export default {
    ...baseConfig,
    input: 'src/main.ts',
    output: [
        {
            format: 'esm',
            file: './dist/index.esm.js',
        },
        {
            name: 'PlainJSX',
            format: 'iife',
            file: './dist/index.iife.js',
        },
    ],
};
