"use client";
import React from "react";
import { Spin, Modal } from "antd";
import styles from "../../styles.module.css";

interface LoadingIndicatorProps {
    type?: "inline" | "overlay" | "center";
    size?: "small" | "default" | "large";
    tip?: string;
    visible?: boolean;
}

/**
 * 统一的加载指示器组件
 * @param props LoadingIndicatorProps
 * @returns JSX.Element
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    type = "center",
    size = "default",
    tip,
    visible = true
}) => {
    const getContainerStyle = () => {
        switch (type) {
            case "inline":
                return {
                    textAlign: "center" as const,
                    padding: "16px"
                };
            case "center":
            default:
                return {
                    textAlign: "center" as const,
                    marginTop: "16px",
                    marginBottom: "16px",
                    height: "160px",
                    display: "flex",
                    justifyContent: "center"
                };
        }
    };

    // overlay类型使用模态框实现
    if (type === "overlay") {
        return (
            <Modal
                open={visible}
                footer={null}
                closable={false}
                centered
                width={200}
                styles={{
                    content: {
                        boxShadow: "none",
                        background: "transparent",
                        border: "none",
                    },
                    body: {
                        padding: "40px 20px",
                        textAlign: "center",
                        background: "transparent",
                    }
                }}
            >
                <Spin size={size} tip={tip} />
            </Modal>
        );
    }

    return (
        <div style={getContainerStyle()}>
            <Spin size={size} tip={tip} />
        </div>
    );
};

LoadingIndicator.displayName = "LoadingIndicator";

export default LoadingIndicator;
