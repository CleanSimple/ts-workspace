import baseConfig from '@lib/rollup-config/lib';

export default [
    {
        ...baseConfig,
        input: {
            'core': 'src/core.ts',
            'index': 'src/index.ts',
            'jsx-runtime': 'src/jsx-runtime.ts',
        },
        output: [
            {
                dir: 'dist',
                format: 'esm',
                entryFileNames: '[name].esm.js',
            },
        ],
    },
    {
        ...baseConfig,
        input: 'src/index.ts',
        output: [
            {
                name: 'PlainJSX',
                format: 'iife',
                file: './dist/index.iife.js',
            },
        ],
    },
];
