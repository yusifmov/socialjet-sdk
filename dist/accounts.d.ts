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
export {};
