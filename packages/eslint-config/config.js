import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import onlyWarn from 'eslint-plugin-only-warn';
import tseslint from 'typescript-eslint';

export default defineConfig([
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        files: ['**/*.js'],
        extends: [tseslint.configs.disableTypeChecked],
    },
    {
        plugins: {
            onlyWarn,
        },
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        // additional rules
        rules: {
            '@typescript-eslint/consistent-type-imports': 'warn',
            '@typescript-eslint/method-signature-style': 'warn',

            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/default-param-last': 'error',
            '@typescript-eslint/prefer-readonly': 'warn',
            '@typescript-eslint/class-methods-use-this': ['warn', {
                ignoreOverrideMethods: true,
                ignoreClassesThatImplementAnInterface: 'public-fields',
            }],
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/prefer-regexp-exec': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },
]);
