;
import React from "react";
import { useSelectForm } from "./useSelectForm";
import SelectFormUI from "./SelectFormUI";

/**
 * SelectForm 组件 - 选择表单主组件，组合了业务逻辑和UI渲染
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useSelectForm hook 中，UI 渲染由 SelectFormUI 组件负责。
 */
const SelectForm: React.FC = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SelectForm render");
    }

    // 使用自定义hook获取业务逻辑
    const { formItemStyle, labelStyle } = useSelectForm();

    return (
        <SelectFormUI 
            formItemStyle={formItemStyle}
            labelStyle={labelStyle}
        />
    );
};

export default React.memo(SelectForm);
