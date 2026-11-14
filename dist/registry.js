import { settingKey } from "./settings.js";
/** Version of the registry contract this SDK was built against. */
export const SDK_API_VERSION = 1;
/** Lower priority first; ties keep registration order (Array.prototype.sort is stable). */
const byPriority = (items) => [...items].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
/** Registering the same key twice replaces the earlier entry instead of duplicating it. */
const upsert = (list, item, sameAs = a => a.slug === item.slug) => {
    const i = list.findIndex(sameAs);
    if (i > -1) {
        list[i] = item;
    }
    else {
        list.push(item);
    }
};
const warnMissing = (what, key) => console.warn(`[SocialJet] ${what} not found: ${key}`);
/**
 * Creates an empty registry. Only the SocialJet host app should call this
 * (through `installRegistry()`); add-ons use the `sj` export instead.
 */
export function createRegistry() {
    const menuItems = [];
    const settingsProviders = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- items of any value type share one registry
    const settingsItems = {};
    const accountProviders = [];
    const postTags = [];
    return {
        apiVersion: SDK_API_VERSION,
        getMenu: () => {
            const items = byPriority(menuItems);
            return items
                .filter(item => !item.parent)
                .map(item => ({ item, children: items.filter(child => child.parent === item.slug) }));
        },
        getMenuItem: (key) => {
            const [parent, slug] = key.includes(':') ? key.split(':', 2) : [null, key];
            const found = menuItems.find(item => item.slug === slug && (parent === null ? !item.parent : item.parent === parent));
            if (!found)
                warnMissing('Menu item', key);
            return found ?? null;
        },
        registerMenuItem: (item) => upsert(menuItems, item, a => a.slug === item.slug && a.parent === item.parent),
        getSettingsProviders: () => byPriority(settingsProviders),
        getSettingsProvider: (key) => {
            const found = settingsProviders.find(item => item.slug === key);
            if (!found)
                warnMissing('Settings provider', key);
            return found ?? null;
        },
        registerSettingsProvider: (item) => upsert(settingsProviders, item),
        getSettingsItems: () => Object.fromEntries(byPriority(Object.values(settingsItems)).map(item => [settingKey(item), item])),
        getSettingsItem: (key) => {
            const found = settingsItems[key];
            if (!found)
                warnMissing('Settings item', key);
            return found ?? null;
        },
        registerSettingsItem: (item) => {
            settingsItems[settingKey(item)] = item;
        },
        unRegisterSettingsItem: (provider, slug) => {
            delete settingsItems[settingKey({ provider, slug })];
        },
        registerAccountProvider: (item) => upsert(accountProviders, item),
        getAccountProviders: () => accountProviders,
        getAccountProvider: (key) => accountProviders.find(item => item.slug === key) ?? null,
        registerPostTag: (tag) => upsert(postTags, tag),
        getPostTags: () => postTags,
        getPostTag: (key) => {
            const found = postTags.find(item => item.slug === key);
            if (!found)
                warnMissing('Post tag', key);
            return found ?? null;
        },
    };
}
/**
 * Installs the registry on `window.SocialJet` (once) and replays registrations
 * add-ons queued before it existed. Host app only.
 */
export function installRegistry() {
    if (!window.SocialJet) {
        window.SocialJet = createRegistry();
    }
    const registry = window.SocialJet;
    for (const [method, args] of window.__SocialJetQueue ?? []) {
        registry[method](...args);
    }
    window.__SocialJetQueue = [];
    return registry;
}
/**
 * The SocialJet registry. Resolves `window.SocialJet` lazily, so add-on bundles
 * share the host's single instance. `register*` calls made before the host has
 * loaded are queued and replayed by `installRegistry()`.
 */
export const sj = new Proxy({}, {
    get(_target, prop) {
        const host = window.SocialJet;
        if (host) {
            if (prop === 'apiVersion' || typeof prop !== 'string')
                return host[prop];
            if (host.apiVersion !== SDK_API_VERSION && !warnedVersion) {
                warnedVersion = true;
                console.warn(`[SocialJet] Add-on built for registry API v${SDK_API_VERSION}, host provides v${host.apiVersion}. Update the add-on with \`npx socialjet update\`.`);
            }
            return host[prop];
        }
        if (typeof prop === 'string' && prop.startsWith('register')) {
            return (...args) => {
                (window.__SocialJetQueue ?? (window.__SocialJetQueue = [])).push([prop, args]);
            };
        }
        throw new Error(`[SocialJet] sj.${String(prop)} was used before the SocialJet app loaded. Only register* calls may run at import time.`);
    },
});
let warnedVersion = false;
