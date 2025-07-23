import { useCallback } from "react";
import type { Book } from "@/types/book";

/**
 * NovelMeta组件的自定义Hook，包含所有业务逻辑
 * @returns 包含书籍元数据处理逻辑的对象
 */
export const useNovelMeta = () => {
  /**
   * 根据状态返回对应的文本和颜色
   * @param bookStatus 书籍状态码
   * @returns 对应的状态标签
   */
  const getStatusTag = useCallback((bookStatus: string) => {
    if (bookStatus === "0") {
      return { color: "processing", text: "连载中" };
    } else if (bookStatus === "1") {
      return { color: "success", text: "已完结" };
    }
    return null;
  }, []);

  /**
   * 处理标签显示
   * @param tagString 标签字符串
   * @param purity 纯度分类
   * @returns 标签数组
   */
  const renderTags = useCallback((tagString: string, purity?: string) => {
    if (!tagString) return { tags: [], purity };

    const tags = tagString.split(",").filter((tag) => tag.trim());
    return { tags, purity };
  }, []);

  /**
   * 处理书籍元数据
   * @param book 书籍对象
   * @returns 处理后的书籍元数据
   */
  const processBookMeta = useCallback((book: Book) => {
    const statusTag = getStatusTag(book.bookStatus);
    const renderedTags = renderTags(book.tag, book.purity);
    
    return {
      ...book,
      statusTag,
      renderedTags
    };
  }, [getStatusTag, renderTags]);

  return {
    getStatusTag,
    renderTags,
    processBookMeta
  };
};
