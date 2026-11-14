import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Alert, Flex, Input, Modal, Switch, Typography } from "antd";
import { useApi } from "../api.js";
/**
 * The "bring your own app" connect dialog: shows the callback URL to register,
 * collects the app credentials and opens the provider's OAuth consent in a popup.
 * The popup posts `{ source: 'socialjet', status, message }` back when done.
 */
export function OAuthAppModal(props) {
    const { fields, allowProxy = true } = props;
    const initial = Object.fromEntries(fields.map(f => [f.name, f.type === 'switch' ? false : '']));
    const [values, setValues] = useState(initial);
    const [useProxy, setUseProxy] = useState(false);
    const [proxy, setProxy] = useState('');
    const callbackApi = useApi();
    const loginUrlApi = useApi();
    const missing = fields.filter(f => f.type !== 'switch' && !String(values[f.name] ?? '').trim());
    const onOpenChange = (open) => {
        if (open && props.callbackUrlEndpoint) {
            callbackApi.sendRequest(props.callbackUrlEndpoint);
        }
    };
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
    const set = (name, value) => setValues(v => ({ ...v, [name]: value }));
    return (_jsx(Modal, { title: props.title, open: props.open, onCancel: () => props.setOpen(false), onOk: authorize, afterOpenChange: onOpenChange, okText: "Authorize", okButtonProps: { disabled: missing.length > 0, loading: loginUrlApi.loading }, destroyOnHidden: true, children: _jsxs(Flex, { vertical: true, gap: 16, children: [props.docsUrl && (_jsxs(Typography.Text, { type: "secondary", children: ["You need your own ", props.appName, " app.", ' ', _jsx(Typography.Link, { href: props.docsUrl, target: "_blank", children: "How to create one" })] })), props.callbackUrlEndpoint && callbackApi.data && (_jsxs("div", { children: [_jsx(Typography.Text, { strong: true, children: "Callback URL" }), _jsxs(Typography.Text, { type: "secondary", style: { display: 'block', marginBottom: 4 }, children: ["Add this as an allowed redirect URL in your ", props.appName, " app settings."] }), _jsx(Typography.Paragraph, { copyable: { text: callbackApi.data.callback_url }, code: true, style: { wordBreak: 'break-all', marginBottom: 0 }, children: callbackApi.data.callback_url })] })), fields.map(field => (_jsxs("div", { children: [_jsx(Typography.Text, { strong: true, style: { display: 'block', marginBottom: 4 }, children: field.label }), field.help && (_jsx(Typography.Text, { type: "secondary", style: { display: 'block', marginBottom: 4 }, children: field.help })), field.type === 'switch' ? (_jsx(Switch, { checked: Boolean(values[field.name]), onChange: c => set(field.name, c) })) : field.secret ? (_jsx(Input.Password, { placeholder: field.placeholder, value: String(values[field.name]), onChange: e => set(field.name, e.target.value) })) : (_jsx(Input, { placeholder: field.placeholder, value: String(values[field.name]), onChange: e => set(field.name, e.target.value) }))] }, field.name))), allowProxy && (_jsxs("div", { children: [_jsxs(Flex, { gap: 8, align: "center", children: [_jsx(Switch, { size: "small", checked: useProxy, onChange: setUseProxy }), _jsx(Typography.Text, { children: "Connect through a proxy" })] }), useProxy && (_jsx(Input, { style: { marginTop: 8 }, placeholder: "http://user:pass@host:port", value: proxy, onChange: e => setProxy(e.target.value) }))] })), (loginUrlApi.error || callbackApi.error) && (_jsx(Alert, { type: "error", showIcon: true, message: loginUrlApi.error || callbackApi.error }))] }) }));
}
