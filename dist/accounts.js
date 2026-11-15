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
/**
 * Tells the Accounts page that accounts were added or failed to connect, so it can
 * refresh and show a message. OAuth popups do this from PHP; call it from flows that
 * don't use a popup (e.g. token-based networks).
 */
export function notifyAccountsChanged(status, message) {
    const result = { source: 'socialjet', status, message };
    window.postMessage(result, window.location.origin);
}
/** Type guard for `message` events carrying an `AccountConnectResult`. */
export const isAccountConnectResult = (data) => !!data && typeof data === 'object' && data.source === 'socialjet';
