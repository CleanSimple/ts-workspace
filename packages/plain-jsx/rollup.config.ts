import type { RollupOptions } from 'rollup';

import baseConfig from '@cleansimple/rollup-config/lib';
import replace from '@rollup/plugin-replace';
import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';

const builds = {
    'full': {
        input: {
            'index': 'src/index.ts',
        },
        plugins: [],
    },
    'slim': {
        input: {
            'index': 'src/index-slim.ts',
        },
        plugins: [
            replace({
                preventAssignment: true,
                values: {
                    'isSignal(value)': 'false',
                    'isSignal(node)': 'false',
                    'resolveReactiveNodes(children)': 'children',
                    'BuiltinComponentMap.get(node.type)': 'false',
                },
                exclude: ['src/reactive-node.ts'],
            }),
        ],
    },
    'jsx-runtime': {
        input: {
            'jsx-runtime': 'src/jsx-runtime.ts',
            'jsx-dev-runtime': 'src/jsx-dev-runtime.ts',
        },
        plugins: [],
    },
};

export default defineConfig([
    ...Object.entries(builds).flatMap(([name, build]): RollupOptions[] => [
        {
            ...baseConfig,
            plugins: [
                ...baseConfig.plugins,
                ...build.plugins,
            ],
            input: build.input,
            external: ['@cleansimple/plain-signals'],
            output: [
                {
                    dir: `dist/${name}`,
                    format: 'esm',
                    entryFileNames: '[name].esm.js',
                    preserveModules: true,
                },
            ],
        },
        {
            ...baseConfig,
            plugins: [
                ...build.plugins,
                dts(),
            ],
            input: build.input,
            external: ['@cleansimple/plain-signals'],
            output: [
                {
                    dir: `dist/${name}/types`,
                    format: 'esm',
                    preserveModules: true,
                },
            ],
        },
    ]),
]);
