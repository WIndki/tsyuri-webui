"use client";
import { Input, Button, Form } from "antd";
import React from "react";
import { SearchOutlined } from "@ant-design/icons";

/**
 * SearchInputProps 接口定义了搜索输入框组件所需的属性
 * @interface SearchInputProps
 * @property {() => void} [onSubmit] - 可选的提交回调函数，在搜索按钮点击时触发
 * @property {boolean} [isLoading] - 可选的加载状态，用于禁用输入框和显示按钮加载状态
 */
interface SearchInputProps {
    onSubmit?: () => void;
    isLoading?: boolean;
}


const SearchInput: React.FC<SearchInputProps> = ({ onSubmit, isLoading = false }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SearchInput render");
    }

    
    return (
        <Form.Item name="keyword" noStyle>
            <Input.Search
                placeholder="请输入搜索关键词..."
                allowClear
                disabled={isLoading}
                enterButton={
                    <Button
                        type="primary"
                        size="large"
                        loading={isLoading}
                        icon={<SearchOutlined />}
                        htmlType="submit"
                    >
                        搜索
                    </Button>
                }
                size="large"
                style={{
                    width: "100%",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
                onSearch={() => {
                    // 取消输入框的焦点
                    if (document.activeElement instanceof HTMLElement) {
                        document.activeElement.blur();
                    }
                    // 执行原有的onSubmit回调
                    if (onSubmit) {
                        onSubmit();
                    }
                }}
            />
        </Form.Item>
    );
};

export default React.memo(SearchInput);
