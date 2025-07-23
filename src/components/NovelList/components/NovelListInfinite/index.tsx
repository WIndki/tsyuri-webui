;
import React, { memo, useCallback } from "react";
import { useNovelListInfinite } from "./useNovelListInfinite";
import NovelListInfiniteUI from "./NovelListInfiniteUI";
import BookDetailModal from "@/components/BookDetailModal";
import { Book } from "@/types/book";
import { App } from "antd";

/**
 * NovelListInfiniteProps 接口定义了无限滚动小说列表组件所需的属性
 * @interface NovelListInfiniteProps
 * @property {string} [emptyText] - 当没有小说时显示的文本，默认为 "暂无小说"
 */
interface NovelListInfiniteProps {
  emptyText?: string;
}

/**
 * NovelListInfinite 组件 - 无限滚动小说列表主组件，组合了业务逻辑和UI渲染
 * @param {NovelListInfiniteProps} props - 组件属性
 * @returns {JSX.Element} 无限滚动小说列表组件
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useNovelListInfinite hook 中，UI 渲染由 NovelListInfiniteUI 组件负责。
 */
const NovelListInfinite: React.FC<NovelListInfiniteProps> = ({ emptyText = "暂无小说" }) => {
  if (process.env.NEXT_PUBLIC_DEBUG === "true") {
    console.log("NovelListInfinite render");
  }

  const { modal } = App.useApp();
  
  // 使用自定义hook获取业务逻辑
  const {
    books,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    error,
    // handleBookClick
  } = useNovelListInfinite();

  // 展示小说详情Modal
  const showBookDetailModal = useCallback(
    (book: Book) => {
      modal.info({
        title: "小说详情",
        footer: null,
        width: 700,
        centered: true,
        maskClosable: true,
        closable: true,
        icon: null,
        open: true,
        styles: {
          mask: {
            backdropFilter: "blur(8px)",
            background: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            maxHeight: "80vh",
            overflowY: "auto",
            overscrollBehavior: "contain",
          },
          header: {
            color: "#d80000",
          },
        },
        content: <BookDetailModal book={book} />,
      });
    },
    [modal]
  );

  // 处理书籍点击事件
  const handleBookCardClick = useCallback(
    (book: Book) => {
      showBookDetailModal(book);
    },
    [showBookDetailModal]
  );

  return (
    <NovelListInfiniteUI
      emptyText={emptyText}
      books={books}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      refresh={refresh}
      error={error}
      onBookClick={handleBookCardClick}
    />
  );
};

NovelListInfinite.displayName = "NovelListInfinite";

export default memo(NovelListInfinite);
