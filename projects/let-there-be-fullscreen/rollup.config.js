import baseConfig from '@lib/rollup-config/userscript';

export default {
    ...baseConfig,
    input: 'src/main.ts',
    output: [
        {
            name: 'LetThereBeFullScreen',
            format: 'iife',
            file: './dist/index.js',
        },
    ],
};
