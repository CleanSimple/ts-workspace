import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { type RollupOptions } from 'rollup';
import { importAsString } from 'rollup-plugin-string-import';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';

const isWatch = process.env['ROLLUP_WATCH'] === 'true';

interface ConfigOptions {
    tsconfig?: string;
}

export default (options: ConfigOptions = {}) => ({
    plugins: [
        tsConfigPaths(),
        resolve(),
        commonjs(),
        typescript({
            tsconfig: options.tsconfig ?? './tsconfig.json',
            noEmitOnError: !isWatch,
        }),
        importAsString({
            include: [
                '**/*.txt',
                '**/*.css',
                '**/*.html',
            ],
        }),
    ],
} satisfies RollupOptions);
