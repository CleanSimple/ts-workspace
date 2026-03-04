import type { RollupOptions } from 'rollup';
import { header } from './utils/header-plugin';
import base from './base';

const baseConfig = base({ tsconfig: './tsconfig.userscript.json' });

export default {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        header({ path: './header.js' }),
    ],
} satisfies RollupOptions;
