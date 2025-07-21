"use client";
import React, { Suspense } from "react";
import { Form, Flex, Spin } from "antd";
import SearchInput from "@/components/SearchForm/SearchInput";
import SelectForm from "@/components/SearchForm/SelectForm";
import type { FormValues } from "@/types/searchFormValue";
import {
    useAppDispatch,
    useAppSelector,
    BookSearchParams,
    setSearchParams,
    selectSearchParams,
} from "@/lib";
import styles from "./styles.module.css";
import Debounce from "@/utils/Debounce";

// 内部组件，使用路由同步
const SearchFormContent: React.FC = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SearchFormContent render");
    }
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    // const displayMode = useAppSelector(selectDisplayMode);
    const searchParams = useAppSelector(selectSearchParams);

    const handleSearch = (values: Partial<BookSearchParams>) => {
        // 使用新的搜索参数管理方式
        const newParams = {
            ...searchParams,
            ...values,
            curr: 1, // 重置当前页码
            limit: 20, // 每页显示20本书
        };
        dispatch(setSearchParams(newParams)); // 设置新的搜索参数
        // RTK Query 会自动根据参数变化触发搜索
    };

    // 将表单值转换为搜索参数
    const convertToSearchParams = (
        values: FormValues
    ): Partial<BookSearchParams> => {
        return {
            keyword: values.keyword,
            sort: values.sort,
            wordCountMin: values.wordCountMin,
            wordCountMax: values.wordCountMax,
            purity: values.purity,
            updatePeriod: values.updatePeriod,
            bookStatus: values.bookStatus,
            tag:
                values.tags && values.tags.length > 0
                    ? "%2C" + values.tags.join("%2C")
                    : undefined,
            source:
                values.sources && values.sources.length > 0
                    ? "%2C" + values.sources.join("%2C")
                    : undefined,
        };
    };

    const debounceHandleSubmit = Debounce(
        (values: FormValues) => {
            const searchParams = convertToSearchParams(values);
            handleSearch(searchParams);
        },
        1000,
        true
    );

    // 获取当前模式下的加载状态
    // 只有在初始化完成后才执行查询
    // const { isLoading: infiniteLoading } = useInfiniteBooks();
    // const { isLoading: paginatedLoading } = usePaginatedBooks();
    // const isLoading = displayMode === "infinite" ? infiniteLoading : paginatedLoading;

    return (
        <div className={styles.searchFormContainer}>
            <Form
                form={form}
                onFinish={debounceHandleSubmit}
                className={styles.searchForm}
            >
                <Flex vertical gap={16}>
                    <SearchInput
                        onSubmit={() => form.submit()}
                        // isLoading={isLoading}
                    />
                    <SelectForm />
                </Flex>
            </Form>
        </div>
    );
};

// 主组件，用 Suspense 包装内部组件
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
SearchForm.displayName = "SearchForm";

export default React.memo(SearchForm);
