# Setup workspace

### Install packages

```sh
yarn install
```

### Init dprint configs

This will generate dprint.json configs from dprint.config.js for all packages (Should also run each time you edit a dprint.config.js):

```sh
yarn run dprint:init-config
```

### Install dprint globally for editor integration

```powershell
iwr https://dprint.dev/install.ps1 -useb | iex
```

# Creating a new userscript project

### Init project

```sh
yarn init
```

### Install dependencies

```
yarn add dprint eslint rollup typescript @types/node -D
yarn add @cleansimple/rollup-config @cleansimple/typescript-config @cleansimple/eslint-config @cleansimple/dprint-config -D
```

External projects should also run this if using typescript configs:

```
yarn add jiti tslib @rollup/plugin-typescript -D
```

### Install Tampermonkey types (Optional):

```
yarn add @types/tampermonkey -D
```

### Install utils package (Optional):

```
yarn add @cleansimple/utils-js
```

### Add typescript config

`tsconfig.json`:

```json
{
    "files": [],
    "references": [
        { "path": "./tsconfig.userscript.json" },
        { "path": "./tsconfig.node.json" }
    ]
}
```

`tsconfig.userscript.json`:

```jsonc
{
    "extends": "@cleansimple/typescript-config/browser.json",
    "compilerOptions": {
        "rootDir": "src",
        "types": ["tampermonkey"]
    },
    "include": ["src"]
}
```

`tsconfig.node.json`:

```json
{
    "extends": "@cleansimple/typescript-config/node.json",
    "include": ["*.config.ts"]
}
```

### Add rollup config

`rollup.config.ts`

```js
import baseConfig from '@cleansimple/rollup-config/userscript';
import { defineConfig } from 'rollup';

export default defineConfig({
    ...baseConfig,
    input: 'src/main.ts',
    output: [
        {
            name: 'Lib', // Module name in code
            format: 'iife',
            file: './dist/index.js',
        },
    ],
});
```

### Add eslint config

`eslint.config.ts`

```js
import config from '@cleansimple/eslint-config/config';

export default config;
```
