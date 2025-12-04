import config from '@cleansimple/eslint-config/config';

export default [
    ...config,
    {
        rules: {
            '@typescript-eslint/prefer-for-of': 'off',
        },
    },
];
