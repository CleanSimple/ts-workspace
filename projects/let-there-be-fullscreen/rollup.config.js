import baseConfig from '@cleansimple/rollup-config/userscript';

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
