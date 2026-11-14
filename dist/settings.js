import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Select } from "antd";
/**
 * Slugs shared with the PHP plugin. The backend reads settings by these exact keys
 * (e.g. `social_post_settings:post_text`), so never change them in one repo only.
 */
export const SETTINGS_PROVIDERS = {
    /** Per-post content settings (post text, templates). */
    SOCIAL_POST: 'social_post_settings',
    /** Global WordPress-related settings. */
    WORDPRESS: 'wordpress',
};
/** Where a settings item can be shown (in addition to account provider slugs). */
export const SETTINGS_TARGETS = {
    SETTINGS_PAGE: 'settings',
    SCHEDULE: 'schedule',
};
export const POST_TEXT_SETTING_KEY = `${SETTINGS_PROVIDERS.SOCIAL_POST}:post_text`;
/** The `"<provider>:<slug>"` key a setting is stored under. */
export const settingKey = (item) => `${item.provider}:${item.slug}`;
/** Identity helper that gives `render` the right value type. */
export const defineSettingsItem = (item) => item;
/**
 * The "post template" selector shown per account in the schedule editor. Its key is
 * `social_post_settings:<provider>_post_template`, which the provider's PHP `Hooks::share` reads.
 */
export function createPostTemplateSetting(options) {
    const { provider, networkName, templates } = options;
    return {
        title: 'Post template',
        slug: `${provider}_post_template`,
        description: `How your post looks on ${networkName}.`,
        provider: SETTINGS_PROVIDERS.SOCIAL_POST,
        targets: [SETTINGS_TARGETS.SCHEDULE, provider],
        defaultValue: options.defaultValue ?? templates[0]?.slug ?? '',
        priority: options.priority ?? 0,
        render: ({ value, setValue }) => (_jsx(Select, { style: { minWidth: 360 }, value: value, onChange: setValue, options: templates.map(t => ({
                value: t.slug,
                label: t.description
                    ? _jsxs("span", { children: [t.title, " ", _jsxs("span", { style: { opacity: .6 }, children: ["\u2014 ", t.description] })] })
                    : t.title,
            })) })),
    };
}
/** Templates most link-sharing networks support. */
export const STANDARD_POST_TEMPLATES = [
    { slug: 'link_card', title: 'Link card', description: 'link preview with title and image' },
    { slug: 'single_image', title: 'Single image', description: 'featured image with the post text' },
    { slug: 'gallery', title: 'Gallery', description: 'all images from the post' },
    { slug: 'text', title: 'Text only' },
];
