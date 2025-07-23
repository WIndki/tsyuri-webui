import { useCallback } from "react";
import { Form } from "antd";
import type { FormValues } from "@/types/searchFormValue";
import {
    useAppDispatch,
    BookSearchParams,
    setSearchParams,
} from "@/lib";
import Debounce from "@/utils/Debounce";

/**
 * SearchForm组件的自定义Hook，包含所有业务逻辑
 * @returns 包含搜索表单处理逻辑的对象
 */
export const useSearchForm = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  
  /**
   * 处理搜索请求
   * @param values 搜索参数
   */
  const handleSearch = useCallback((values: Partial<BookSearchParams>) => {
    // 使用新的搜索参数管理方式
    const newParams = {
      ...values,
      curr: 1, // 重置当前页码
      limit: 20, // 每页显示20本书
    };
    dispatch(setSearchParams(newParams)); // 设置新的搜索参数
    // RTK Query 会自动根据参数变化触发搜索
  }, [dispatch]);

  /**
   * 将表单值转换为搜索参数
   * @param values 表单值
   * @returns 搜索参数
   */
  const convertToSearchParams = useCallback((
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
  }, []);

  /**
   * 防抖处理的提交函数
   */
  const debounceHandleSubmit = useCallback(
    Debounce(
      (values: FormValues) => {
        const searchParams = convertToSearchParams(values);
        handleSearch(searchParams);
      },
      1000,
      true
    ),
    [convertToSearchParams, handleSearch]
  ); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 提交表单
   */
  const submitForm = useCallback(() => {
    form.submit();
  }, [form]);

  return {
    form,
    handleSearch,
    convertToSearchParams,
    debounceHandleSubmit,
    submitForm
  };
};
