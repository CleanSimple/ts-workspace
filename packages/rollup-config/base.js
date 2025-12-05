import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { defineConfig } from 'rollup';
import { importAsString } from 'rollup-plugin-string-import';
import typescript from '@rollup/plugin-typescript';
import tsConfigPaths from "rollup-plugin-tsconfig-paths"

const isWatch = process.env.ROLLUP_WATCH === 'true';

export default defineConfig({
    plugins: [
        tsConfigPaths(),
        resolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
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
});
