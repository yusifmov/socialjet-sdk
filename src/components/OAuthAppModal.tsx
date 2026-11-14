import {ReactNode, useEffect, useState} from "react";
import {Alert, Flex, Input, Modal, Switch, Typography} from "antd";
import {useApi} from "../api.js";

export interface OAuthAppField {
    /** Key sent to the login-url endpoint (e.g. `client_id`). */
    name: string
    label: string
    placeholder?: string
    help?: ReactNode
    /** Masked input for secrets and tokens. */
    secret?: boolean
    /** A toggle instead of a text field (sent as boolean). */
    type?: 'text' | 'switch'
}

export interface OAuthAppModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    title: ReactNode
    /** Provider slug, sent as `provider`. */
    provider: string
    /** Shown in help texts, e.g. "Meta", "LinkedIn". */
    appName: string
    /** Route returning `{ callback_url }`. Omit for networks without a redirect URL. */
    callbackUrlEndpoint?: string
    /** Route returning `{ login_url }`, which opens in a popup. */
    loginUrlEndpoint: string
    fields: OAuthAppField[]
    /** Show the proxy toggle. Default true. */
    allowProxy?: boolean
    /** Link to the provider's developer console / setup guide. */
    docsUrl?: string
}

/**
 * The "bring your own app" connect dialog: shows the callback URL to register,
 * collects the app credentials and opens the provider's OAuth consent in a popup.
 * The popup posts `{ source: 'socialjet', status, message }` back when done.
 */
export function OAuthAppModal(props: OAuthAppModalProps) {
    const {fields, allowProxy = true} = props;
    const initial = Object.fromEntries(fields.map(f => [f.name, f.type === 'switch' ? false : '']));
    const [values, setValues] = useState<Record<string, string | boolean>>(initial);
    const [useProxy, setUseProxy] = useState(false);
    const [proxy, setProxy] = useState('');

    const callbackApi = useApi<null, { callback_url: string }>();
    const loginUrlApi = useApi<Record<string, unknown>, { login_url: string }>();

    const missing = fields.filter(f => f.type !== 'switch' && !String(values[f.name] ?? '').trim());

    // Fetch on open (the dialog is often mounted already open, so afterOpenChange can't be relied on).
    const {open, callbackUrlEndpoint} = props;
    const fetchCallbackUrl = callbackApi.sendRequest;
    useEffect(() => {
        if (open && callbackUrlEndpoint) {
            fetchCallbackUrl(callbackUrlEndpoint);
        }
    }, [open, callbackUrlEndpoint, fetchCallbackUrl]);

    const authorize = async () => {
        const data = await loginUrlApi.sendRequest(props.loginUrlEndpoint, {
            ...values,
            proxy: useProxy ? proxy : '',
            provider: props.provider,
        });

        if (data?.login_url) {
            window.open(data.login_url, '_blank', 'width=800,height=700');
        }
    };

    const set = (name: string, value: string | boolean) => setValues(v => ({...v, [name]: value}));

    return (
        <Modal
            title={props.title}
            open={props.open}
            onCancel={() => props.setOpen(false)}
            onOk={authorize}
            okText="Authorize"
            okButtonProps={{disabled: missing.length > 0, loading: loginUrlApi.loading}}
            destroyOnHidden
        >
            <Flex vertical gap={16}>
                {props.docsUrl && (
                    <Typography.Text type="secondary">
                        You need your own {props.appName} app.{' '}
                        <Typography.Link href={props.docsUrl} target="_blank">How to create one</Typography.Link>
                    </Typography.Text>
                )}

                {props.callbackUrlEndpoint && callbackApi.data && (
                    <div>
                        <Typography.Text strong>Callback URL</Typography.Text>
                        <Typography.Text type="secondary" style={{display: 'block', marginBottom: 4}}>
                            Add this as an allowed redirect URL in your {props.appName} app settings.
                        </Typography.Text>
                        <Typography.Paragraph copyable={{text: callbackApi.data.callback_url}}
                                              code style={{wordBreak: 'break-all', marginBottom: 0}}>
                            {callbackApi.data.callback_url}
                        </Typography.Paragraph>
                    </div>
                )}

                {fields.map(field => (
                    <div key={field.name}>
                        <Typography.Text strong style={{display: 'block', marginBottom: 4}}>{field.label}</Typography.Text>
                        {field.help && (
                            <Typography.Text type="secondary" style={{display: 'block', marginBottom: 4}}>{field.help}</Typography.Text>
                        )}
                        {field.type === 'switch' ? (
                            <Switch checked={Boolean(values[field.name])} onChange={c => set(field.name, c)}/>
                        ) : field.secret ? (
                            <Input.Password placeholder={field.placeholder} value={String(values[field.name])}
                                            onChange={e => set(field.name, e.target.value)}/>
                        ) : (
                            <Input placeholder={field.placeholder} value={String(values[field.name])}
                                   onChange={e => set(field.name, e.target.value)}/>
                        )}
                    </div>
                ))}

                {allowProxy && (
                    <div>
                        <Flex gap={8} align="center">
                            <Switch size="small" checked={useProxy} onChange={setUseProxy}/>
                            <Typography.Text>Connect through a proxy</Typography.Text>
                        </Flex>
                        {useProxy && (
                            <Input style={{marginTop: 8}} placeholder="http://user:pass@host:port" value={proxy}
                                   onChange={e => setProxy(e.target.value)}/>
                        )}
                    </div>
                )}

                {(loginUrlApi.error || callbackApi.error) && (
                    <Alert type="error" showIcon message={loginUrlApi.error || callbackApi.error}/>
                )}
            </Flex>
        </Modal>
    );
}
