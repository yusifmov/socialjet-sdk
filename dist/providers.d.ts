import type { FC, ReactNode } from "react";
import type { AccountProviderType, AuthModalPropsType, PostTemplateType } from "./types.js";
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
}
/**
 * Builds an `AccountProviderType` with the behaviour every network shares, so a
 * provider only declares what is specific to it.
 */
export declare function createAccountProvider(options: CreateAccountProviderOptions): AccountProviderType;
