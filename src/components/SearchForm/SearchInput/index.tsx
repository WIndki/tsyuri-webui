;
import React from "react";
import { useSearchInput } from "./useSearchInput";
import SearchInputUI from "./SearchInputUI";

interface SearchInputProps {
    onSubmit?: () => void;
    isLoading?: boolean;
}

/**
 * SearchInput 组件 - 搜索输入框主组件，组合了业务逻辑和UI渲染
 * @param props SearchInputProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useSearchInput hook 中，UI 渲染由 SearchInputUI 组件负责。
 */
const SearchInput: React.FC<SearchInputProps> = ({ onSubmit, isLoading = false }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SearchInput render");
    }

    // 使用自定义hook获取业务逻辑
    const { handleSearch } = useSearchInput();

    return (
        <SearchInputUI
            onSubmit={onSubmit}
            isLoading={isLoading}
            handleSearch={handleSearch}
        />
    );
};

export default React.memo(SearchInput);
