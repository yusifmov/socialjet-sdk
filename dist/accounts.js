/**
 * Converts an account row as WordPress sends it into an `AccountType`.
 * WordPress returns every column as a string, so `is_expired` arrives as `"0"`/`"1"`,
 * and `"0"` is truthy in JS.
 */
export function normalizeAccount(raw) {
    return {
        ...raw,
        is_expired: raw.is_expired === true || Number(raw.is_expired) === 1,
    };
}
/** True when the account's token expired and it must be reconnected. Safe on raw rows too. */
export const isAccountExpired = (account) => account.is_expired === true || Number(account.is_expired) === 1;
