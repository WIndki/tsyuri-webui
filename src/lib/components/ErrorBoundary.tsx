"use client";
import React, { Component, ReactNode, ErrorInfo } from "react";
import { Result, Button } from "antd";
import { ReloadOutlined, BugOutlined } from "@ant-design/icons";

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showErrorDetails?: boolean;
}

/**
 * 全局错误边界组件
 * 用于捕获 React 组件树中的 JavaScript 错误
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { 
            hasError: true, 
            error 
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // 记录错误信息
        this.setState({
            error,
            errorInfo
        });

        // 调用外部错误处理函数
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // 在开发环境下打印错误详情
        if (process.env.NEXT_PUBLIC_DEBUG === "true") {
            console.error("ErrorBoundary捕获到错误:", error);
            console.error("错误详细信息:", errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // 如果提供了自定义错误UI，使用它
            if (this.props.fallback) {
                return this.props.fallback(
                    this.state.error, 
                    this.state.errorInfo!, 
                    this.handleRetry
                );
            }

            // 默认错误UI
            return (
                <div style={{ 
                    padding: '24px', 
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Result
                        status="error"
                        title="页面出现错误"
                        subTitle="抱歉，页面遇到了一些问题。您可以尝试刷新页面或联系技术支持。"
                        extra={[
                            <Button 
                                key="retry" 
                                type="primary" 
                                icon={<ReloadOutlined />} 
                                onClick={this.handleRetry}
                            >
                                重试
                            </Button>,
                            <Button 
                                key="reload" 
                                onClick={() => window.location.reload()}
                            >
                                刷新页面
                            </Button>
                        ]}
                    >
                        {this.props.showErrorDetails && (
                            <div className="error-details" style={{ 
                                marginTop: '16px', 
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                padding: '16px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontFamily: 'monospace'
                            }}>
                                <div style={{ 
                                    marginBottom: '8px', 
                                    fontWeight: 'bold',
                                    color: '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <BugOutlined />
                                    错误详情：
                                </div>
                                <div style={{ color: '#d32f2f' }}>
                                    {this.state.error.name}: {this.state.error.message}
                                </div>
                                {this.state.error.stack && (
                                    <details style={{ marginTop: '8px' }}>
                                        <summary style={{ cursor: 'pointer', color: '#666' }}>
                                            查看堆栈信息
                                        </summary>
                                        <pre style={{ 
                                            marginTop: '8px', 
                                            whiteSpace: 'pre-wrap',
                                            fontSize: '11px',
                                            color: '#666'
                                        }}>
                                            {this.state.error.stack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}
                    </Result>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}

/**
 * Hook：在函数组件中使用错误边界
 */
export function useErrorBoundary() {
    const [error, setError] = React.useState<Error | null>(null);

    const captureError = React.useCallback((error: Error) => {
        setError(error);
    }, []);

    const resetError = React.useCallback(() => {
        setError(null);
    }, []);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return { captureError, resetError };
}

export default ErrorBoundary;
