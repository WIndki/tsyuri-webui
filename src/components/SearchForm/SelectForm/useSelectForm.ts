import { useMemo } from "react";

/**
 * useSelectForm Hook - 封装选择表单的业务逻辑
 * @returns {Object} 包含选择表单相关业务逻辑的对象
 */
export const useSelectForm = () => {
    const formItemStyle = useMemo(() => ({
        marginBottom: 12,
    }), []);

    const labelStyle = useMemo(() => ({
        paddingRight: 8,
        display: "flex",
        alignItems: "center",
    }), []);

    return {
        formItemStyle,
        labelStyle
    };
};
