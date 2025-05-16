# Setup workspace

- Install packages
```sh
yarn install
```

- Generate dprint.json configs from dprint.config.js for all packages (Should also run each time you edit a dprint.config.js):
```sh
yarn run init-dprint-config
```

- Install dprint globally for editor integration
```powershell
iwr https://dprint.dev/install.ps1 -useb | iex
```

# Create user script project:

- Init project:
```sh
yarn init
```

- Install configs
```sh
yarn add @lib/rollup-config @lib/typescript-config @lib/eslint-config @lib/dprint-config -D
```

- Install Tampermonky types
```
yarn add @types/tampermonkey -D
```

- Install utils package (Optional):
```
yarn add @lib/util
```

- Create `tsconfig.json`
```json
{
    "extends": "@lib/typescript-config/browser.json",
    "include": ["src"],
}
```

- Create `rollup.config.js`
```js
import baseConfig from '@lib/rollup-config/userscript';
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
import config from '@lib/eslint-config/config';

export default config;
```
