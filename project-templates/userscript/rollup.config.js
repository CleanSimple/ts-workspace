import baseConfig from '@lib/rollup-config/userscript';

export default {
    ...baseConfig,
    input: 'src/main.tsx',
    output: [
        {
            name: 'SampleProject',
            format: 'iife',
            file: `./dist/index.js`,
        },
    ],
};
