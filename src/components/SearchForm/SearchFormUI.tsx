import React from "react";
import { Form, Flex } from "antd";
import type { FormInstance } from "antd";
import SearchInput from "./SearchInput/index";
import SelectForm from "./SelectForm/index";
import type { FormValues } from "@/types/searchFormValue";
import styles from "./styles.module.css";

interface SearchFormUIProps {
    form: FormInstance;
    debounceHandleSubmit: (values: FormValues) => void;
    submitForm: () => void;
    // isLoading?: boolean;
}

/**
 * SearchFormUI 组件 - 专门负责搜索表单的UI渲染
 * @param props SearchFormUIProps
 * @returns JSX.Element
 */
const SearchFormUI: React.FC<SearchFormUIProps> = ({ 
    form,
    debounceHandleSubmit,
    submitForm,
    // isLoading
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SearchFormUI render");
    }

    return (
        <div className={styles.searchFormContainer}>
            <Form
                form={form}
                onFinish={debounceHandleSubmit}
                className={styles.searchForm}
            >
                <Flex vertical gap={16}>
                    <SearchInput
                        onSubmit={submitForm}
                        // isLoading={isLoading}
                    />
                    <SelectForm />
                </Flex>
            </Form>
        </div>
    );
};

SearchFormUI.displayName = "SearchFormUI";

export default SearchFormUI;
