import { header } from '../utils/header-plugin.js';
import base from './base.js';
const baseConfig = base({ tsconfig: './tsconfig.userscript.json' });
export default {
    ...baseConfig,
    plugins: [
        ...baseConfig.plugins,
        header({ path: './header.js' }),
    ],
};
