;
import React, { memo } from "react";
import { useNovelList } from "./useNovelList";
import NovelListUI from "./NovelListUI";

/**
 * NovelListProps 接口定义了 NovelList 组件所需的属性
 * @interface NovelListProps
 * @property {string} [emptyText] - 当没有小说时显示的文本，默认为 "暂无小说"
 */
interface NovelListProps {
  emptyText?: string;
}

/**
 * NovelList 组件 - 小说列表主组件，组合了业务逻辑和UI渲染
 * @param {NovelListProps} props - 组件属性
 * @returns {JSX.Element} 小说列表组件
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useNovelList hook 中，UI 渲染由 NovelListUI 组件负责。
 */
const NovelList: React.FC<NovelListProps> = ({ emptyText = "暂无小说" }) => {
  if (process.env.NEXT_PUBLIC_DEBUG === "true") {
    console.log("NovelList render");
  }

  // 使用自定义hook获取业务逻辑
  const { displayMode } = useNovelList();

  return (
    <NovelListUI 
      emptyText={emptyText}
      displayMode={displayMode}
    />
  );
};

NovelList.displayName = "NovelList";

export default memo(NovelList);
