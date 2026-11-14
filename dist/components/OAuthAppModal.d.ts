import { ReactNode } from "react";
export interface OAuthAppField {
    /** Key sent to the login-url endpoint (e.g. `client_id`). */
    name: string;
    label: string;
    placeholder?: string;
    help?: ReactNode;
    /** Masked input for secrets and tokens. */
    secret?: boolean;
    /** A toggle instead of a text field (sent as boolean). */
    type?: 'text' | 'switch';
}
export interface OAuthAppModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: ReactNode;
    /** Provider slug, sent as `provider`. */
    provider: string;
    /** Shown in help texts, e.g. "Meta", "LinkedIn". */
    appName: string;
    /** Route returning `{ callback_url }`. Omit for networks without a redirect URL. */
    callbackUrlEndpoint?: string;
    /** Route returning `{ login_url }`, which opens in a popup. */
    loginUrlEndpoint: string;
    fields: OAuthAppField[];
    /** Show the proxy toggle. Default true. */
    allowProxy?: boolean;
    /** Link to the provider's developer console / setup guide. */
    docsUrl?: string;
}
/**
 * The "bring your own app" connect dialog: shows the callback URL to register,
 * collects the app credentials and opens the provider's OAuth consent in a popup.
 * The popup posts `{ source: 'socialjet', status, message }` back when done.
 */
export declare function OAuthAppModal(props: OAuthAppModalProps): import("react").JSX.Element;
