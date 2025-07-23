;
import React, { Suspense } from "react";
import { Spin } from "antd";
import SearchFormUI from "./SearchFormUI";
import { useSearchForm } from "./useSearchForm";
import styles from "./styles.module.css";

// 内部组件，使用路由同步
const SearchFormContent: React.FC = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SearchFormContent render");
    }
    
    // 使用自定义hook获取业务逻辑
    const { 
        form,
        debounceHandleSubmit,
        submitForm
    } = useSearchForm();

    return (
        <SearchFormUI
            form={form}
            debounceHandleSubmit={debounceHandleSubmit}
            submitForm={submitForm}
        />
    );
};

// 主组件，用Suspense包裹内部组件
const SearchForm: React.FC = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SearchForm render");
    }

    return (
        <Suspense
            fallback={
                <div className={styles.searchFormContainer}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        padding: '20px' 
                    }}>
                        <Spin size="default" />
                    </div>
                </div>
            }
        >
            <SearchFormContent />
        </Suspense>
    );
};

SearchForm.displayName = "SearchForm"; // 设置组件名称，便于调试

export default React.memo(SearchForm);
