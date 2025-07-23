;
import React from "react";
import NovelListInfinite from "./components/NovelListInfinite/index";
import NovelListPagination from "./components/NovelListPagination/index";

/**
 * NovelListUIProps 接口定义了 NovelListUI 组件所需的属性
 * @interface NovelListUIProps
 * @property {string} [emptyText] - 当没有小说时显示的文本，默认为 "暂无小说"
 * @property {"pagination" | "infinite"} displayMode - 显示模式
 */
interface NovelListUIProps {
  emptyText?: string;
  displayMode: "pagination" | "infinite";
}

/**
 * NovelListUI 组件 - 专门负责小说列表的UI渲染
 * @param {NovelListUIProps} props - 组件属性
 * @returns {JSX.Element} 小说列表UI组件
 */
const NovelListUI: React.FC<NovelListUIProps> = ({ 
  emptyText = "暂无小说",
  displayMode
}) => {
  if (process.env.NEXT_PUBLIC_DEBUG === "true") {
    console.log("NovelListUI render");
  }

  if (displayMode === "pagination") {
    return <NovelListPagination emptyText={emptyText} />;
  }

  return <NovelListInfinite emptyText={emptyText} />;
};

export default React.memo(NovelListUI);
