import type { FC, ReactNode } from "react";
/**
 * A connected social account, as returned by `socialjet/accounts/all`
 * (secrets are stripped server-side). Run raw rows through `normalizeAccount()`.
 */
export interface AccountType {
    id: number;
    title: string;
    provider: string;
    /** The publish target id on the social network (page id, board id, chat id...). */
    account_key?: string;
    session_key?: string;
    picture?: string;
    link?: string;
    type?: string;
    data?: object;
    /** GMT `Y-m-d H:i:s`. */
    expires_at?: string;
    is_expired?: boolean;
}
export interface AuthModalPropsType {
    open: boolean;
    setOpen: (open: boolean) => void;
}
export interface PostTemplateType {
    slug: string;
    title: string;
    description?: string;
}
export interface SettingsItemRenderProps<T> {
    value: T | undefined;
    setValue: (value: T) => void;
    account?: AccountType;
}
export interface SettingsItemType<T> {
    title: ReactNode;
    /** Unique within its provider. The stored key is `"<provider>:<slug>"` — see `settingKey()`. */
    slug: string;
    /**
     * Where the setting appears: `'settings'` (global Settings page), `'schedule'` (per-account
     * schedule settings) and/or account provider slugs it applies to.
     */
    targets: string[];
    /** The settings provider (group) slug. */
    provider: string;
    description: ReactNode;
    priority: number;
    defaultValue: T;
    render: (props: SettingsItemRenderProps<T>) => ReactNode;
}
export interface SettingsProviderType {
    title: ReactNode;
    description: ReactNode;
    icon: ReactNode;
    priority: number;
    slug: string;
}
export interface AccountProviderType {
    slug: string;
    title: string;
    description: string;
    picture: ReactNode;
    getAccountTypeText: (accountOrTypeKey: AccountType | string) => string;
    supportsSetting: <T>(account: AccountType, setting: SettingsItemType<T>) => boolean;
    getPostTemplates: (account: AccountType) => PostTemplateType[];
    AuthModal: FC<AuthModalPropsType>;
}
export interface MenuItemType {
    title: ReactNode;
    slug: string;
    priority: number;
    icon?: ReactNode;
    /** Slug of the parent menu item, for submenu entries. */
    parent?: string;
    render?: FC;
    actions: ReactNode[];
}
export interface MenuType {
    item: MenuItemType;
    children: MenuItemType[];
}
export interface PostTagType {
    slug: string;
    title: ReactNode;
    description: ReactNode;
    icon?: ReactNode;
    settingsView?: FC<{
        params: Record<string, string>;
        setParams: (params: Record<string, string>) => void;
    }>;
    defaultParams: {
        type: string;
        [key: string]: string;
    };
}
/** The registry the host app installs on `window.SocialJet`. */
export interface SocialJetType {
    /** Bumped when the registry contract changes incompatibly. */
    apiVersion: number;
    registerMenuItem: (menuItem: MenuItemType) => void;
    getMenu: () => MenuType[];
    getMenuItem: (key: string) => MenuItemType | null;
    registerSettingsProvider: (settingsProvider: SettingsProviderType) => void;
    getSettingsProviders: () => SettingsProviderType[];
    getSettingsProvider: (key: string) => SettingsProviderType | null;
    registerSettingsItem: <T>(settingsItem: SettingsItemType<T>) => void;
    unRegisterSettingsItem: (provider: string, slug: string) => void;
    getSettingsItems: <T>() => Record<string, SettingsItemType<T>>;
    getSettingsItem: <T>(key: string) => SettingsItemType<T> | null;
    registerAccountProvider: (accountProvider: AccountProviderType) => void;
    getAccountProviders: () => AccountProviderType[];
    getAccountProvider: (key: string) => AccountProviderType | null;
    registerPostTag: (postTag: PostTagType) => void;
    getPostTags: () => PostTagType[];
    getPostTag: (key: string) => PostTagType | null;
}
declare global {
    interface Window {
        SocialJet?: SocialJetType;
        /** Registrations made before the host installed the registry. */
        __SocialJetQueue?: [keyof SocialJetType, unknown[]][];
        SocialJetRestUrl: string;
        SocialJetNonce: string;
        SocialJetCronUrl: string;
    }
}
