import config from '@cleansimple/eslint-config/config';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    ...config,
    {
        rules: {
            '@typescript-eslint/prefer-for-of': 'off',
        },
    },
]);
