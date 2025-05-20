"use client";
import React from "react";
import { Form, Flex } from "antd";
import SearchInput from "@/components/SearchInput";
import SelectForm from "@/components/SelectForm";
import { BookSearchParams } from "@/services/SearchRequest";
import type { FormValues } from "@/types/searchFormValue";

interface SearchFormProps {
    onSearch: (values: Partial<BookSearchParams>) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
    const [form] = Form.useForm();

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
        onSearch(searchParams);
    };

    return (
        <Form
            form={form}
            onFinish={handleSubmit}
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
    );
};

export default SearchForm;
