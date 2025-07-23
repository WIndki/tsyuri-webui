;
import React from "react";
import { Spin, Modal } from "antd";

interface LoadingIndicatorUIProps {
    type?: "inline" | "overlay" | "center";
    size?: "small" | "default" | "large";
    tip?: string;
    visible?: boolean;
    getContainerStyle: (type: "inline" | "overlay" | "center") => React.CSSProperties;
}

/**
 * LoadingIndicatorUI 组件 - 专门负责加载指示器的UI渲染
 * @param props LoadingIndicatorUIProps
 * @returns JSX.Element
 */
const LoadingIndicatorUI: React.FC<LoadingIndicatorUIProps> = ({
    type = "center",
    size = "default",
    tip,
    visible = true,
    getContainerStyle
}) => {
    // overlay类型使用模态框实现
    if (type === "overlay") {
        console.log("LoadingIndicatorUI - modal");
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
        <div style={getContainerStyle(type)}>
            <Spin size={size} tip={tip} />
        </div>
    );
};

export default React.memo(LoadingIndicatorUI);
