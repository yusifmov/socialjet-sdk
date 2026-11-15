import type { PostTemplateType, SettingsItemType } from "./types.js";
/**
 * Slugs shared with the PHP plugin. The backend reads settings by these exact keys
 * (e.g. `social_post_settings:post_text`), so never change them in one repo only.
 */
export declare const SETTINGS_PROVIDERS: {
    /** Per-post content settings (post text, templates). */
    readonly SOCIAL_POST: "social_post_settings";
    /** Global WordPress-related settings. */
    readonly WORDPRESS: "wordpress";
};
/** Where a settings item can be shown (in addition to account provider slugs). */
export declare const SETTINGS_TARGETS: {
    readonly SETTINGS_PAGE: "settings";
    readonly SCHEDULE: "schedule";
};
export declare const POST_TEXT_SETTING_KEY: string;
/** The `"<provider>:<slug>"` key a setting is stored under. */
export declare const settingKey: (item: {
    provider: string;
    slug: string;
}) => string;
/** Identity helper that gives `render` the right value type. */
export declare const defineSettingsItem: <T>(item: SettingsItemType<T>) => SettingsItemType<T>;
/**
 * The "post template" selector shown per account in the schedule editor. Its key is
 * `social_post_settings:<provider>_post_template`, which the provider's PHP `Hooks::share` reads.
 */
export declare function createPostTemplateSetting(options: {
    provider: string;
    networkName: string;
    templates: PostTemplateType[];
    defaultValue?: string;
    priority?: number;
}): SettingsItemType<string>;
/** Templates most link-sharing networks support. */
export declare const STANDARD_POST_TEMPLATES: PostTemplateType[];
