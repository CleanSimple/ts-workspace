import resolve from '@rollup/plugin-node-resolve';
import { defineConfig } from 'rollup';
import { importAsString } from 'rollup-plugin-string-import';
import typescript from 'rollup-plugin-typescript2';

export default defineConfig({
    plugins: [
        resolve(),
        typescript({
            tsconfig: './tsconfig.json',
            useTsconfigDeclarationDir: true,
            clean: true,
        }),
        importAsString({
            include: [
                '**/*.css',
                '**/*.html',
            ],
        }),
    ],
});
