import type { AccountType } from "./types.js";
type RawAccount = Omit<AccountType, 'is_expired'> & {
    is_expired?: boolean | number | string | null;
};
/**
 * Converts an account row as WordPress sends it into an `AccountType`.
 * WordPress returns every column as a string, so `is_expired` arrives as `"0"`/`"1"`,
 * and `"0"` is truthy in JS.
 */
export declare function normalizeAccount<A extends RawAccount>(raw: A): A & AccountType;
/** True when the account's token expired and it must be reconnected. Safe on raw rows too. */
export declare const isAccountExpired: (account: RawAccount) => boolean;
/** The message the OAuth popup (and other connect flows) post to the SocialJet window. */
export interface AccountConnectResult {
    source: 'socialjet';
    status: boolean;
    message: string;
}
/**
 * Tells the Accounts page that accounts were added or failed to connect, so it can
 * refresh and show a message. OAuth popups do this from PHP; call it from flows that
 * don't use a popup (e.g. token-based networks).
 */
export declare function notifyAccountsChanged(status: boolean, message: string): void;
/** Type guard for `message` events carrying an `AccountConnectResult`. */
export declare const isAccountConnectResult: (data: unknown) => data is AccountConnectResult;
export {};
