import baseConfig from '@cleansimple/rollup-config/lib';

export default [
    {
        ...baseConfig,
        input: 'src/index.ts',
        output: [
            {
                dir: 'dist',
                format: 'esm',
                entryFileNames: '[name].esm.js',
                preserveModules: true,
            },
        ],
    },
    {
        ...baseConfig,
        input: 'src/index.ts',
        output: [
            {
                name: 'PlainSignals',
                format: 'iife',
                file: './dist/index.iife.js',
            },
        ],
    },
];
