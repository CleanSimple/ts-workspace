import baseConfig from '@cleansimple/rollup-config/lib';

export default {
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
};
