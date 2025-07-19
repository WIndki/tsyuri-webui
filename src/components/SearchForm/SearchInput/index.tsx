"use client";
import { Input, Button, Form } from "antd";
import React from "react";
import { SearchOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/redux/hooks";

/**
 * SearchInputProps 接口定义了搜索输入框组件所需的属性
 * @interface SearchInputProps
 * @property {() => void} [onSubmit] - 可选的提交回调函数，在搜索按钮点击时触发
 */
interface SearchInputProps {
    onSubmit?: () => void;
}



const SearchInput: React.FC<SearchInputProps> = ({ onSubmit }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SearchInput render");
    }
    const { loading } = useAppSelector((state) => state.books);
    return (
        <Form.Item name="keyword" noStyle>
            <Input.Search
                placeholder="请输入搜索关键词..."
                allowClear
                disabled={loading}
                enterButton={
                    <Button
                        type="primary"
                        size="large"
                        loading={loading}
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
