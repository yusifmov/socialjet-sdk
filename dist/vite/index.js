/**
 * Vite helpers for SocialJet.
 *
 * The plugin serves React, antd, dayjs (see `shared-deps.json`) once, as WordPress
 * script modules with the ids `@socialjet/shared/<package>`. The host app and every
 * add-on import those instead of bundling their own copy — a second React copy
 * breaks hooks, a second antd copy breaks theming.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const sdkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const sharedDeps = JSON.parse(readFileSync(path.join(sdkRoot, 'shared-deps.json'), 'utf8'));
export const SHARED_PREFIX = '@socialjet/shared/';
/** `react-dom/client` -> `@socialjet/shared/react-dom/client` (the WordPress script module id). */
export const sharedModuleId = (pkg) => SHARED_PREFIX + pkg;
/** `@ant-design/cssinjs` -> `ant-design-cssinjs.js` (the file under `build/shared/`). */
export const sharedModuleFile = (pkg) => pkg.replace(/^@/, '').replace(/\//g, '-') + '.js';
const sharedIds = new Set(sharedDeps.modules.map(m => m.id));
const sharedPackageRoots = new Set(sharedDeps.modules.map(m => m.id.startsWith('@') ? m.id.split('/').slice(0, 2).join('/') : m.id.split('/')[0]));
/**
 * Rewrites imports of shared packages to the `@socialjet/shared/*` script modules and
 * keeps them out of the bundle. Deep imports (`antd/es/...`) are rejected because they
 * would bundle a second copy.
 */
export function socialjetSharedExternals() {
    const WRAPPER = '\0socialjet-external:';
    return {
        name: 'socialjet:shared-externals',
        apply: 'build',
        enforce: 'pre',
        resolveId(source, importer) {
            if (source.startsWith(SHARED_PREFIX)) {
                return { id: source, external: true };
            }
            if (sharedIds.has(source)) {
                // Not external directly: CommonJS dependencies (e.g. use-sync-external-store)
                // `require('react')`, which ES module output can't do for an external. A tiny
                // bundled ESM wrapper that re-exports the external works for import and require.
                return WRAPPER + source;
            }
            const root = source.startsWith('@') ? source.split('/').slice(0, 2).join('/') : source.split('/')[0];
            if (sharedPackageRoots.has(root) && !source.startsWith('dayjs/')) {
                const message = `[socialjet] "${source}" bundles a private copy of a shared package. Import from "${root}" instead.`;
                if (importer && !importer.includes('node_modules'))
                    this.error(message);
                this.warn(`${message} (imported by ${importer})`);
            }
            return null;
        },
        load(id) {
            if (!id.startsWith(WRAPPER))
                return null;
            const pkg = id.slice(WRAPPER.length);
            const target = JSON.stringify(sharedModuleId(pkg));
            const mod = sharedDeps.modules.find(m => m.id === pkg);
            return `export * from ${target};` + (mod?.cjs ? `\nexport {default} from ${target};` : '');
        },
    };
}
/** Vite config for a SocialJet add-on: one ES module per entry in `build/`, shared packages external. */
export function defineAddonConfig(options) {
    return {
        plugins: [socialjetSharedExternals(), ...(options.plugins ?? [])],
        resolve: { dedupe: [...sharedPackageRoots] },
        build: {
            outDir: options.outDir ?? 'build',
            emptyOutDir: true,
            target: 'es2020',
            rollupOptions: {
                input: options.entries,
                preserveEntrySignatures: 'exports-only',
                output: {
                    format: 'es',
                    entryFileNames: '[name].js',
                    chunkFileNames: 'chunks/[name]-[hash].js',
                    assetFileNames: 'assets/[name]-[hash][extname]',
                },
            },
        },
    };
}
/**
 * Vite config that builds the shared packages themselves into `<outDir>/shared/`,
 * plus `modules.json` (`{ "<module id>": "<file>" }`) for the plugin to register.
 * Used by the SocialJet frontend only. Run after the main build (it doesn't empty outDir).
 */
export function defineSharedModulesConfig(options) {
    const outDir = path.resolve(options.root, options.outDir ?? 'build', 'shared');
    const require = createRequire(path.join(options.root, 'package.json'));
    const VIRTUAL = '\0socialjet-shared:';
    const entryCode = (mod) => {
        if (!mod.cjs) {
            return `export * from ${JSON.stringify(mod.id)};`;
        }
        // CommonJS can't be re-exported statically with `export *`; list its keys.
        const keys = Object.keys(require(mod.id)).filter(k => k !== 'default' && /^[A-Za-z_$][\w$]*$/.test(k));
        return [
            `import m from ${JSON.stringify(mod.id)};`,
            `export default m;`,
            ...keys.map(k => `export const ${k} = m.${k};`),
        ].join('\n');
    };
    const plugin = {
        name: 'socialjet:shared-modules',
        resolveId(source) {
            return source.startsWith(VIRTUAL) ? source : null;
        },
        load(id) {
            if (!id.startsWith(VIRTUAL))
                return null;
            const mod = sharedDeps.modules.find(m => m.id === id.slice(VIRTUAL.length));
            return mod ? entryCode(mod) : null;
        },
        closeBundle() {
            mkdirSync(outDir, { recursive: true });
            const manifest = Object.fromEntries(sharedDeps.modules.map(m => [sharedModuleId(m.id), sharedModuleFile(m.id)]));
            writeFileSync(path.join(outDir, 'modules.json'), JSON.stringify(manifest, null, 2));
        },
    };
    return {
        root: options.root,
        plugins: [plugin],
        define: { 'process.env.NODE_ENV': JSON.stringify('production') },
        build: {
            outDir,
            emptyOutDir: true,
            target: 'es2020',
            minify: true,
            rollupOptions: {
                input: Object.fromEntries(sharedDeps.modules.map(m => [sharedModuleFile(m.id).replace(/\.js$/, ''), VIRTUAL + m.id])),
                preserveEntrySignatures: 'strict',
                output: {
                    format: 'es',
                    entryFileNames: '[name].js',
                    chunkFileNames: 'chunks/[name]-[hash].js',
                },
            },
        },
    };
}
