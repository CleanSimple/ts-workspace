import type { RollupOptions } from 'rollup';
import base from './base';
import { userscript } from './utils/userscript-plugin';

const baseConfig = base({ tsconfig: './tsconfig.userscript.json' });

export default {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        userscript(),
    ],
} satisfies RollupOptions;
