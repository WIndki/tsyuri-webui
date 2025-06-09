"use client";
import React from "react";
import { Form, Flex } from "antd";
import SearchInput from "@/components/SearchForm/SearchInput";
import SelectForm from "@/components/SearchForm/SelectForm";
import { BookSearchParams } from "@/services/SearchRequest";
import type { FormValues } from "@/types/searchFormValue";
import { useAppDispatch } from "@/redux/hooks";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/store";
import {
    resetBooks,
    searchBooks,
    setSearchParams,
    setUrlParams,
} from "@/redux/slices/booksSlice";
import styles from "./styles.module.css";
import Debounce from "@/utils/Debounce";

const SearchForm: React.FC = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SearchForm render");
    }
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    const handleSearch = (values: Partial<BookSearchParams>) => {
        dispatch(resetBooks()); // 重置书籍列表
        const newParams = {
            // ...searchParams,
            ...values,
            curr: 1, // 重置当前页码
            limit: 20, // 每页显示20本书
        };
        dispatch(setSearchParams(newParams)); // 设置新的搜索参数
        dispatch(setUrlParams()); // 更新 URL 参数
        dispatch(searchBooks(newParams)); // 执行搜索操作
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

    const handleSubmit = (values: FormValues) => {
        const searchParams = convertToSearchParams(values);
        handleSearch(searchParams);
    };

    const debounceHandleSubmit = Debounce(handleSubmit, 1000, true);

    return (
        <div className={styles.searchFormContainer}>
            <Form
                form={form}
                onFinish={debounceHandleSubmit}
                className={styles.searchForm}
                // initialValues={{
                //     keyword: "",
                //     tags: ["变百", "百合"],
                //     sort: "last_index_update_time",
                //     wordCountMin: "",
                //     wordCountMax: "",
                //     purity: "",
                //     updatePeriod: "",
                //     bookStatus: "",
                //     sources: ["SF轻小说", "次元姬", "刺猬猫", "起点"],
                // }}
            >
                <Flex vertical gap={16}>
                    <SearchInput onSubmit={() => form.submit()} />
                    <SelectForm />
                </Flex>
            </Form>
        </div>
    );
};

export default React.memo(SearchForm);
