import { POST_TEXT_SETTING_KEY, settingKey } from "./settings.js";
/**
 * Builds an `AccountProviderType` with the behaviour every network shares, so a
 * provider only declares what is specific to it.
 */
export function createAccountProvider(options) {
    const sharedSettings = options.sharedSettings ?? [POST_TEXT_SETTING_KEY];
    return {
        slug: options.slug,
        title: options.title,
        description: options.description ?? options.title,
        picture: options.icon,
        AuthModal: options.AuthModal,
        getAccountTypeText: (accountOrType) => {
            const type = typeof accountOrType === 'string' ? accountOrType : accountOrType.type;
            return (type && options.accountTypes?.[type]) || options.defaultTypeText || options.title;
        },
        supportsSetting: (account, setting) => {
            const byDefault = setting.targets.includes(account.provider) || sharedSettings.includes(settingKey(setting));
            return options.supportsSetting
                ? options.supportsSetting(account, setting, byDefault)
                : byDefault;
        },
        getPostTemplates: () => options.postTemplates ?? [],
    };
}
