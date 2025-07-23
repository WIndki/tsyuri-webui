import { useCallback } from "react";
import { App } from "antd";

/**
 * BookInfo组件的自定义Hook，包含所有业务逻辑
 * @returns 包含书籍信息处理逻辑的对象
 */
export const useBookInfo = () => {
  const { notification } = App.useApp();

  /**
   * 格式化字数显示
   * @param wordCount 字数字符串
   * @returns 格式化后的字数显示文本
   */
  const formatWordCount = useCallback((wordCount: string) => {
    const count = parseInt(wordCount);
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万字`;
    }
    return `${count}字`;
  }, []);

  /**
   * 获取状态文本
   * @param bookStatus 书籍状态码
   * @returns 对应的状态文本
   */
  const getStatusText = useCallback((bookStatus: string) => {
    if (bookStatus === "0") {
      return "连载中";
    } else if (bookStatus === "1") {
      return "已完结";
    }
    return "未知";
  }, []);

  /**
   * 复制书籍名称到剪贴板
   * @param bookName 书籍名称
   */
  const copyBookName = useCallback((bookName: string) => {
    navigator.clipboard.writeText(bookName);
    notification.success({
      message: "复制成功",
      description: `已将 "${bookName}" 复制到剪贴板`,
      placement: "topRight",
      duration: 2,
    });
  }, [notification]);

  /**
   * 搜索书籍
   * @param bookName 书籍名称
   */
  const searchBook = useCallback((bookName: string) => {
    notification.success({
      message: "即将跳转搜索引擎",
      description: `将前往搜索引擎搜索 "${bookName}"`,
      placement: "topRight",
      duration: 2,
      onClose: () => {
        const url = `https://www.baidu.com/s?wd=${bookName}`;
        // 判断是否为iOS设备
        const deviceAgent = navigator.userAgent;
        const ios = deviceAgent
          .toLowerCase()
          .match(/(iphone|ipod|ipad|mac|macintosh)/);
        if (ios) {
          // iOS设备使用window.location.href
          window.location.href = url;
        } else {
          window.open(url, "_blank");
        }
      },
    });
  }, [notification]);

  return {
    formatWordCount,
    getStatusText,
    copyBookName,
    searchBook
  };
};
