import type { FC, ReactNode } from "react";
import type { AccountProviderType, AccountType, AuthModalPropsType, PostTemplateType, SettingsItemType } from "./types.js";
export interface CreateAccountProviderOptions {
    /** Must equal the provider slug used by the PHP add-on (`$account['provider']`). */
    slug: string;
    title: string;
    description?: string;
    icon: ReactNode;
    AuthModal: FC<AuthModalPropsType>;
    /** Label per account `type` (e.g. `{page: 'LinkedIn Page'}`). */
    accountTypes?: Record<string, string>;
    /** Label for unknown types. Defaults to the title. */
    defaultTypeText?: string;
    /**
     * Setting keys (`"<provider>:<slug>"`) this provider supports besides the settings
     * that target it directly. Defaults to the shared post text setting.
     */
    sharedSettings?: string[];
    postTemplates?: PostTemplateType[];
    /**
     * Override which settings an account gets. `supportsByDefault` is the result of
     * the default rule (targets this provider, or listed in `sharedSettings`).
     */
    supportsSetting?: (account: AccountType, setting: SettingsItemType<unknown>, supportsByDefault: boolean) => boolean;
}
/**
 * Builds an `AccountProviderType` with the behaviour every network shares, so a
 * provider only declares what is specific to it.
 */
export declare function createAccountProvider(options: CreateAccountProviderOptions): AccountProviderType;
