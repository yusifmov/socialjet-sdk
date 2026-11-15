import {Select} from "antd";
import type {PostTemplateType, SettingsItemType} from "./types.js";

/**
 * Slugs shared with the PHP plugin. The backend reads settings by these exact keys
 * (e.g. `social_post_settings:post_text`), so never change them in one repo only.
 */
export const SETTINGS_PROVIDERS = {
    /** Per-post content settings (post text, templates). */
    SOCIAL_POST: 'social_post_settings',
    /** Global WordPress-related settings. */
    WORDPRESS: 'wordpress',
} as const;

/** Where a settings item can be shown (in addition to account provider slugs). */
export const SETTINGS_TARGETS = {
    SETTINGS_PAGE: 'settings',
    SCHEDULE: 'schedule',
} as const;

export const POST_TEXT_SETTING_KEY = `${SETTINGS_PROVIDERS.SOCIAL_POST}:post_text`;

/** The `"<provider>:<slug>"` key a setting is stored under. */
export const settingKey = (item: { provider: string, slug: string }) => `${item.provider}:${item.slug}`;

/** Identity helper that gives `render` the right value type. */
export const defineSettingsItem = <T, >(item: SettingsItemType<T>): SettingsItemType<T> => item;

/**
 * The "post template" selector shown per account in the schedule editor. Its key is
 * `social_post_settings:<provider>_post_template`, which the provider's PHP `Hooks::share` reads.
 */
export function createPostTemplateSetting(options: {
    provider: string
    networkName: string
    templates: PostTemplateType[]
    defaultValue?: string
    priority?: number
}): SettingsItemType<string> {
    const {provider, networkName, templates} = options;

    return {
        title: 'Post template',
        slug: `${provider}_post_template`,
        description: `How your post looks on ${networkName}.`,
        provider: SETTINGS_PROVIDERS.SOCIAL_POST,
        targets: [SETTINGS_TARGETS.SCHEDULE, provider],
        defaultValue: options.defaultValue ?? templates[0]?.slug ?? '',
        priority: options.priority ?? 0,
        render: ({value, setValue}) => (
            <Select
                style={{minWidth: 360}}
                value={value}
                onChange={setValue}
                options={templates.map(t => ({
                    value: t.slug,
                    label: t.description
                        ? <span>{t.title} <span style={{opacity: .6}}>— {t.description}</span></span>
                        : t.title,
                }))}
            />
        ),
    };
}

/** Templates most link-sharing networks support. */
export const STANDARD_POST_TEMPLATES: PostTemplateType[] = [
    {slug: 'link_card', title: 'Link card', description: 'link preview with title and image'},
    {slug: 'single_image', title: 'Single image', description: 'featured image with the post text'},
    {slug: 'gallery', title: 'Gallery', description: 'all images from the post'},
    {slug: 'text', title: 'Text only'},
];
