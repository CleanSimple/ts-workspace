import baseConfig from '@cleansimple/rollup-config/userscript';

export default {
    ...baseConfig,
    input: 'src/main.ts',
    output: [
        {
            name: 'AntiDevToolsDetector',
            format: 'iife',
            file: './dist/index.js',
        },
    ],
};
