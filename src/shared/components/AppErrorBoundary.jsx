import React from "react";
import ErrorScreen from "../components/ErrorScreen";

export default class AppErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // 필요하면 여기서 로깅(Sentry 등)
        // console.log(error, info);
    }

    reset = () => this.setState({ hasError: false });

    render() {
        if (this.state.hasError) {
            return <ErrorScreen onRetry={this.reset} />;
        }
        return this.props.children;
    }
}
