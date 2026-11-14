import type { SocialJetType } from "./types.js";
/** Version of the registry contract this SDK was built against. */
export declare const SDK_API_VERSION = 1;
/**
 * Creates an empty registry. Only the SocialJet host app should call this
 * (through `installRegistry()`); add-ons use the `sj` export instead.
 */
export declare function createRegistry(): SocialJetType;
/**
 * Installs the registry on `window.SocialJet` (once) and replays registrations
 * add-ons queued before it existed. Host app only.
 */
export declare function installRegistry(): SocialJetType;
/**
 * The SocialJet registry. Resolves `window.SocialJet` lazily, so add-on bundles
 * share the host's single instance. `register*` calls made before the host has
 * loaded are queued and replayed by `installRegistry()`.
 */
export declare const sj: SocialJetType;
