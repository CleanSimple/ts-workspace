import baseConfig from '@cleansimple/rollup-config/userscript';

export default {
    ...baseConfig,
    input: 'src/main.tsx',
    output: [
        {
            name: 'YouTubeSaveTime',
            format: 'iife',
            file: `./dist/index.js`,
        },
    ],
};
