import { useCallback } from "react";
import type { Book } from "@/types/book";
import { formatWordCount, formatUpdateTime } from "./utils";

/**
 * NovelCard组件的自定义Hook，包含所有业务逻辑
 * @returns 包含格式化函数和处理函数的对象
 */
export const useNovelCard = () => {
  /**
   * 格式化书籍字数显示
   * @param wordCount 字数字符串
   * @returns 格式化后的字数显示文本
   */
  const formatBookWordCount = useCallback((wordCount: string) => {
    return formatWordCount(wordCount);
  }, []);

  /**
   * 格式化书籍更新时间显示
   * @param time 时间字符串
   * @returns 格式化后的更新时间显示文本
   */
  const formatBookUpdateTime = useCallback((time: string) => {
    return formatUpdateTime(time);
  }, []);

  /**
   * 获取书籍状态标签
   * @param bookStatus 书籍状态码
   * @returns 对应的状态标签文本
   */
  const getBookStatusText = useCallback((bookStatus: string) => {
    if (bookStatus === "0") {
      return "连载中";
    } else if (bookStatus === "1") {
      return "已完结";
    }
    return "";
  }, []);

  /**
   * 处理卡片点击事件
   * @param book 点击的书籍对象
   * @param onCardClick 点击回调函数
   */
  const handleCardClick = useCallback((book: Book, onCardClick?: (book: Book) => void) => {
    if (onCardClick) {
      onCardClick(book);
    }
  }, []);

  return {
    formatBookWordCount,
    formatBookUpdateTime,
    getBookStatusText,
    handleCardClick
  };
};
