import eslint from '@eslint/js';
import onlyWarn from 'eslint-plugin-only-warn';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
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
            '@typescript-eslint/promise-function-async': 'warn',

            '@typescript-eslint/explicit-member-accessibility': 'error',
            '@typescript-eslint/default-param-last': 'error',
            '@typescript-eslint/prefer-readonly': 'warn',
            '@typescript-eslint/class-methods-use-this': 'warn',
            '@typescript-eslint/switch-exhaustiveness-check': 'warn',
        },
    },
    {
        files: ['**/*.js'],
        extends: [tseslint.configs.disableTypeChecked],
    },
    {
        plugins: {
            onlyWarn,
        },
    },
);
