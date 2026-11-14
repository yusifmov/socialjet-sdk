import { Component, ErrorInfo, ReactNode } from "react";
interface Props {
    children: ReactNode;
    /** Changing this resets the boundary (e.g. the current page slug). */
    resetKey?: string;
}
interface State {
    error: Error | null;
    resetKey?: string;
}
/** Keeps one broken page or add-on from blanking the whole SocialJet admin screen. */
export declare class ErrorBoundary extends Component<Props, State> {
    state: State;
    static getDerivedStateFromError(error: Error): Partial<State>;
    static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null;
    componentDidCatch(error: Error, info: ErrorInfo): void;
    render(): string | number | boolean | Iterable<ReactNode> | import("react").JSX.Element | null | undefined;
}
export {};
