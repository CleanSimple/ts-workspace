import baseConfig from '@cleansimple/rollup-config/lib';

export default [
    {
        ...baseConfig,
        input: {
            'index': 'src/index.ts',
            'jsx-runtime': 'src/jsx-runtime.ts',
            'jsx-dev-runtime': 'src/jsx-dev-runtime.ts',
        },
        external: ['@cleansimple/plain-signals'],
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
        external: ['@cleansimple/plain-signals'],
        output: [
            {
                name: 'PlainJSX',
                format: 'iife',
                globals: { '@cleansimple/plain-signals': 'PlainSignals' },
                file: './dist/index.iife.js',
            },
        ],
    },
];
