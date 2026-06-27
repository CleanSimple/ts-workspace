/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require('@yarnpkg/types');

module.exports = defineConfig({
    async constraints({ Yarn }) {

        /**
         * ensures that all workspaces use the same version as the root workspace
         * @param {string} dependencyName
         */
        function enforceVersion(dependencyName) {
            const deps = Yarn.dependencies({ ident: dependencyName });
            const rootDep = deps.find(dep => dep.workspace.cwd === '.');
            if (!rootDep) {
                throw new Error(`Failed to enforce version for ${dependencyName}`);
            }

            for (const dep of deps) {
                if (dep === rootDep)
                    continue;
                if (dep.type === "peerDependencies")
                    continue;

                dep.update(rootDep.range);
            }
        }

        // locks dependencies to exact version
        for (const dep of Yarn.dependencies()) {
            if (dep.type === "peerDependencies")
                continue
            dep.update(dep.range.replace(/^[*^~]/, ''));
        }

        enforceVersion("dprint");
        enforceVersion("eslint");
        enforceVersion("rollup");
        enforceVersion("typescript");
    },
});
