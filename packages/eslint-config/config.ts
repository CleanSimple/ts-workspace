import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

type ConfigWithExtendsArray = Parameters<typeof defineConfig>[0];

const warnOnly = (config: ConfigWithExtendsArray): ConfigWithExtendsArray => {
    if (Array.isArray(config)) {
        return config.map((subConfig) => warnOnly(subConfig));
    }
    else {
        config = { ...config };
        config.rules = Object.fromEntries(
            Object.entries(config.rules ?? {}).map(([ruleName, ruleEntry]) => {
                if (Array.isArray(ruleEntry)) {
                    const [severity, ...options] = ruleEntry;
                    ruleEntry = [
                        severity === 'error' ? 'warn' : severity,
                        ...options,
                    ];
                }
                else if (ruleEntry === 'error') {
                    ruleEntry = 'warn';
                }
                return [ruleName, ruleEntry];
            }),
        );
        return config;
    }
};

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            warnOnly(eslint.configs.recommended),
            warnOnly(tseslint.configs.recommendedTypeChecked),
            warnOnly(tseslint.configs.stylisticTypeChecked),
        ],
        plugins: {
            'import': importPlugin,
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        // additional rules
        rules: {
            '@typescript-eslint/no-import-type-side-effects': 'warn',
            '@typescript-eslint/method-signature-style': 'warn',
            '@typescript-eslint/no-empty-object-type': ['warn', {
                allowInterfaces: 'always',
            }],

            '@typescript-eslint/explicit-member-accessibility': 'warn',
            '@typescript-eslint/default-param-last': 'error',
            '@typescript-eslint/prefer-readonly': 'warn',
            '@typescript-eslint/class-methods-use-this': ['warn', {
                ignoreOverrideMethods: true,
                ignoreClassesThatImplementAnInterface: 'public-fields',
            }],
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/prefer-regexp-exec': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

            // import rules
            'import/order': ['warn', {
                groups: [
                    'type',
                ],
                'newlines-between': 'always',
            }],
            'import/no-duplicates': 'warn',
            'import/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
        },
    },
]);
