import { Button, Result } from "antd";
import React from "react";

export const ErrorPage: React.FC = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("ErrorPage render");
    }
    return (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Result
                status="error"
                title="操作失败"
                subTitle="抱歉，发生了一些错误，请检查并稍后重试。"
                extra={[
                    <Button type="primary" key="home" onClick={() => window.location.href = '/'}>
                        返回首页
                    </Button>,
                ]}
            />
        </div>
    )
}