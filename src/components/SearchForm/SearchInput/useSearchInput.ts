import { useCallback } from "react";

/**
 * useSearchInput Hook - 封装搜索输入框的业务逻辑
 * @returns {Object} 包含搜索输入框相关业务逻辑的对象
 */
export const useSearchInput = () => {
    /**
     * 处理搜索操作
     * @param onSubmit 可选的提交回调函数
     */
    const handleSearch = useCallback((onSubmit?: () => void) => {
        // 取消输入框的焦点
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        // 执行原有的onSubmit回调
        if (onSubmit) {
            onSubmit();
        }
    }, []);

    return {
        handleSearch
    };
};
