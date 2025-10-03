/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require('@yarnpkg/types');



module.exports = defineConfig({
    async constraints({ Yarn }) {

        /**
         * @param {string} dependencyName
         * @param {string} version
         */
        function enforce_version(dependencyName, version) {
            for (const dep of Yarn.dependencies({ ident: dependencyName })) {
                dep.update(version);
            }
        }

        enforce_version("dprint", "0.50.2");
        enforce_version("eslint", "9.36.0");
        enforce_version("rollup", "4.52.4");
        enforce_version("typescript", "5.9.3");
    },
});
