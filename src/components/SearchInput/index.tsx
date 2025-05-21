"use client";
import { Input, Button, Form } from "antd";
import React from "react";
import { SearchOutlined } from "@ant-design/icons";

interface SearchInputProps {
    onSubmit?: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSubmit }) => {
    return (
        <Form.Item name="keyword" noStyle>
            <Input.Search
                placeholder="请输入搜索关键词..."
                allowClear
                enterButton={
                    <Button
                        type="primary"
                        size="large"
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
                    borderRadius: "8px",
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

export default SearchInput;
