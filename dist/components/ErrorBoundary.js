import { jsx as _jsx } from "react/jsx-runtime";
import { Component } from "react";
import { Button, Result } from "antd";
/** Keeps one broken page or add-on from blanking the whole SocialJet admin screen. */
export class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.state = { error: null, resetKey: this.props.resetKey };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    static getDerivedStateFromProps(props, state) {
        if (props.resetKey !== state.resetKey) {
            return { error: null, resetKey: props.resetKey };
        }
        return null;
    }
    componentDidCatch(error, info) {
        console.error('[SocialJet] Page crashed:', error, info.componentStack);
    }
    render() {
        if (this.state.error) {
            return (_jsx(Result, { status: "error", title: "Something went wrong on this page", subTitle: this.state.error.message, extra: _jsx(Button, { onClick: () => this.setState({ error: null }), children: "Try again" }) }));
        }
        return this.props.children;
    }
}
