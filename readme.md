# Setup workspace

- Install packages

```sh
yarn install
```

- Generate dprint.json configs from dprint.config.js for all packages (Should also run each time you edit a dprint.config.js):

```sh
yarn run dprint:init-config
```

- Install dprint globally for editor integration

```powershell
iwr https://dprint.dev/install.ps1 -useb | iex
```

# Create a userscript project:

- Init project:

```sh
yarn init
```

- Install configs

```sh
yarn add @cleansimple/rollup-config @cleansimple/typescript-config @cleansimple/eslint-config @cleansimple/dprint-config -D
```

- Install Tampermonkey types

```
yarn add @types/tampermonkey -D
```

- Install utils package (Optional):

```
yarn add @cleansimple/utils-js
```

- Create `tsconfig.json`

```json
{
    "extends": "@cleansimple/typescript-config/browser.json",
    "include": ["src"],
    "compilerOptions": {
        "rootDir": "src"
    }
}
```

- Create `rollup.config.js`

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

- Create `eslint.config.js`

```js
import config from '@cleansimple/eslint-config/config';

export default config;
```
