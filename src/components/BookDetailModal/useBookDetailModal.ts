import { useCallback } from "react";
import type { Book } from "@/types/book";

/**
 * BookDetailModal组件的自定义Hook，包含所有业务逻辑
 * @returns 包含书籍详情处理逻辑的对象
 */
export const useBookDetailModal = () => {
  /**
   * 处理书籍详情显示
   * @param book 书籍对象
   * @returns 处理后的书籍详情信息
   */
  const processBookDetail = useCallback((book: Book) => {
    // 这里可以添加任何需要的书籍详情处理逻辑
    // 目前直接返回书籍对象
    return book;
  }, []);

  /**
   * 格式化书籍字数显示
   * @param wordCount 字数字符串
   * @returns 格式化后的字数显示文本
   */
  const formatBookWordCount = useCallback((wordCount: string) => {
    const count = parseInt(wordCount);
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万字`;
    }
    return `${count}字`;
  }, []);

  /**
   * 格式化书籍更新时间显示
   * @param time 时间字符串
   * @returns 格式化后的更新时间显示文本
   */
  const formatBookUpdateTime = useCallback((time: string) => {
    const updateTime = new Date(time);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - updateTime.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      return "今天";
    } else if (diffDays === 1) {
      return "昨天";
    } else if (diffDays < 30) {
      return `${diffDays}天前`;
    } else {
      return updateTime.toLocaleDateString();
    }
  }, []);

  return {
    processBookDetail,
    formatBookWordCount,
    formatBookUpdateTime
  };
};
