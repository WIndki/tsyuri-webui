"use client";

import React from "react";
import { Result, Button, Typography, Collapse } from "antd";
import { ExclamationCircleOutlined, ReloadOutlined } from "@ant-design/icons";

const { Paragraph } = Typography;
const { Panel } = Collapse;

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    return (
        <div style={{ 
            padding: '2rem',
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Result
                status="error"
                icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                title="页面加载失败"
                subTitle="很抱歉，页面加载时发生了错误。请尝试刷新页面或稍后再试。"
                extra={[
                    <Button 
                        type="primary" 
                        icon={<ReloadOutlined />}
                        onClick={reset}
                        key="retry"
                        size="large"
                    >
                        重新加载
                    </Button>,
                    <Button 
                        key="home"
                        size="large"
                        onClick={() => window.location.href = '/'}
                    >
                        返回首页
                    </Button>
                ]}
            >
                {process.env.NODE_ENV === 'development' && (
                    <div style={{ textAlign: 'left', marginTop: '2rem' }}>
                        <Collapse ghost>
                            <Panel 
                                header="错误详情（开发模式）" 
                                key="error-details"
                            >
                                <Paragraph 
                                    code 
                                    style={{ 
                                        backgroundColor: '#f6f8fa',
                                        padding: '1rem',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}
                                >
                                    {error.message || '未知错误'}
                                    {error.digest && (
                                        <>
                                            {'\n\n'}
                                            错误摘要: {error.digest}
                                        </>
                                    )}
                                    {error.stack && (
                                        <>
                                            {'\n\n'}
                                            错误堆栈:
                                            {'\n'}
                                            {error.stack}
                                        </>
                                    )}
                                </Paragraph>
                            </Panel>
                        </Collapse>
                    </div>
                )}
            </Result>
        </div>
    );
}