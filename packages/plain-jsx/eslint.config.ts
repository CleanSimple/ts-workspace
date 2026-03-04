import config from '@cleansimple/eslint-config/config';
import { defineConfig } from 'eslint/config';

export default defineConfig({
    extends: config,
    rules: {
        '@typescript-eslint/prefer-for-of': 'off',
    },
});
