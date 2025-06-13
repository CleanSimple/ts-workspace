import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const TERSER_OPTIONS = {
    module: true,
    compress: { passes: 3 },
    mangle: true,
};

export default {
    input: 'src/main.tsx',
    output: { file: 'dist/main.js', format: 'iife' },
    plugins: [
        resolve(),
        typescript({
            tsconfig: './tsconfig.json',
            useTsconfigDeclarationDir: true,
            clean: true,
        }),
        process.env.production && terser(TERSER_OPTIONS),
    ].filter(Boolean),
};
