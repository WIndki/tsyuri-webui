"use client";
import React, { memo } from "react";
import { useAppSelector } from "@/lib/hooks";
import { selectDisplayMode } from "@/lib/features/theme/themeSlice";
import NovelListInfinite from "./components/NovelListInfinite";
import NovelListPagination from "./components/NovelListPagination";

/**
 * NovelListProps 接口定义了 NovelList 组件所需的属性
 * @interface NovelListProps
 * @property {string} [emptyText] - 当没有小说时显示的文本，默认为 "暂无小说"
 */
interface NovelListProps {
    emptyText?: string;
}

/**
 * 小说列表组件 - 统一入口
 * 根据当前的显示模式自动选择合适的列表组件
 * @param {NovelListProps} props - 小说列表组件属性
 * @returns {JSX.Element} 小说列表组件
 * @description
 * 该组件根据Redux中的displayMode状态来决定渲染无限滚动列表还是分页列表。
 */
const NovelList: React.FC<NovelListProps> = ({ emptyText = "暂无小说" }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelList render");
    }
    
    const displayMode = useAppSelector(selectDisplayMode);

    if (displayMode === "pagination") {
        return <NovelListPagination emptyText={emptyText} />;
    }

    return <NovelListInfinite emptyText={emptyText} />;
};

NovelList.displayName = "NovelList";

export default memo(NovelList);
