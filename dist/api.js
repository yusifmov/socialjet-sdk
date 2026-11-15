import { useCallback, useRef, useState } from "react";
/**
 * POSTs to a SocialJet REST route (all routes are POST and need `manage_options`).
 * Resolves with the `data` payload; throws an Error carrying the server's message
 * (the plugin wraps exceptions as `{ message }`, WordPress itself as `{ code, message }`).
 */
export async function apiFetch(endpoint, body, headers) {
    const response = await fetch(window.SocialJetRestUrl + endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-WP-Nonce": window.SocialJetNonce,
            ...headers,
        },
        body: JSON.stringify(body),
    });
    let result = null;
    try {
        result = await response.json();
    }
    catch {
        // Non-JSON body (PHP fatal, proxy error page...) — handled below.
    }
    if (result?.message) {
        throw new Error(result.message);
    }
    if (!response.ok || result === null) {
        throw new Error(`Request failed (HTTP ${response.status}).`);
    }
    return result.data ?? null;
}
/**
 * `apiFetch` with React state. `sendRequest` is stable across renders and resolves
 * with `null` on failure (the message is in `error`). Only the latest call updates
 * state, so a slow, older response can't overwrite a newer one.
 */
export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const latestCall = useRef(0);
    const sendRequest = useCallback(async (endpoint, body, headers) => {
        const call = ++latestCall.current;
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(endpoint, body, headers);
            if (call === latestCall.current)
                setData(res);
            return res;
        }
        catch (e) {
            if (call === latestCall.current) {
                setError(e instanceof Error ? e.message : "An error occurred while fetching data.");
            }
            return null;
        }
        finally {
            if (call === latestCall.current)
                setLoading(false);
        }
    }, []);
    return { sendRequest, loading, error, data };
}
