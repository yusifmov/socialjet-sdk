/**
 * POSTs to a SocialJet REST route (all routes are POST and need `manage_options`).
 * Resolves with the `data` payload; throws an Error carrying the server's message
 * (the plugin wraps exceptions as `{ message }`, WordPress itself as `{ code, message }`).
 */
export declare function apiFetch<B, T>(endpoint: string, body?: B, headers?: Record<string, string>): Promise<T | null>;
/**
 * `apiFetch` with React state. `sendRequest` is stable across renders and resolves
 * with `null` on failure (the message is in `error`). Only the latest call updates
 * state, so a slow, older response can't overwrite a newer one.
 */
export declare function useApi<B, T>(): {
    sendRequest: (endpoint: string, body?: B, headers?: Record<string, string>) => Promise<T | null>;
    loading: boolean;
    error: string | null;
    data: T | null;
};
