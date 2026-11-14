import type { Plugin, PluginOption, UserConfig } from "vite";
interface SharedModule {
    id: string;
    /** CommonJS package: named exports are generated from its runtime keys. */
    cjs?: boolean;
}
interface SharedDeps {
    runtime: Record<string, string>;
    dev: Record<string, string>;
    modules: SharedModule[];
}
export declare const sharedDeps: SharedDeps;
export declare const SHARED_PREFIX = "@socialjet/shared/";
/** `react-dom/client` -> `@socialjet/shared/react-dom/client` (the WordPress script module id). */
export declare const sharedModuleId: (pkg: string) => string;
/** `@ant-design/cssinjs` -> `ant-design-cssinjs.js` (the file under `build/shared/`). */
export declare const sharedModuleFile: (pkg: string) => string;
/**
 * Rewrites imports of shared packages to the `@socialjet/shared/*` script modules and
 * keeps them out of the bundle. Deep imports (`antd/es/...`) are rejected because they
 * would bundle a second copy.
 */
export declare function socialjetSharedExternals(): Plugin;
/** Vite config for a SocialJet add-on: one ES module per entry in `build/`, shared packages external. */
export declare function defineAddonConfig(options: {
    /** Entry points, e.g. `{ index: 'src/index.tsx' }`. Each becomes `build/<name>.js`. */
    entries: Record<string, string>;
    outDir?: string;
    plugins?: PluginOption[];
}): UserConfig;
/**
 * Vite config that builds the shared packages themselves into `<outDir>/shared/`,
 * plus `modules.json` (`{ "<module id>": "<file>" }`) for the plugin to register.
 * Used by the SocialJet frontend only. Run after the main build (it doesn't empty outDir).
 */
export declare function defineSharedModulesConfig(options: {
    root: string;
    outDir?: string;
}): UserConfig;
export {};
