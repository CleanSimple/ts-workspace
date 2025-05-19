import baseConfig from '@lib/rollup-config/userscript';

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
