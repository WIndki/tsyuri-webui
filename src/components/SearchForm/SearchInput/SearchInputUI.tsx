;
import { Input, Button, Form } from "antd";
import React from "react";
import { SearchOutlined } from "@ant-design/icons";

interface SearchInputUIProps {
    onSubmit?: () => void;
    isLoading?: boolean;
    handleSearch: (onSubmit?: () => void) => void;
}

/**
 * SearchInputUI 组件 - 专门负责搜索输入框的UI渲染
 * @param props SearchInputUIProps
 * @returns JSX.Element
 */
const SearchInputUI: React.FC<SearchInputUIProps> = ({ 
    onSubmit, 
    isLoading = false,
    handleSearch
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SearchInputUI render");
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
                    handleSearch(onSubmit);
                }}
            />
        </Form.Item>
    );
};

export default React.memo(SearchInputUI);
