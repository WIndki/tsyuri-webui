"use client";
import { Divider, Layout, message, notification } from "antd";
import React, { createContext, useEffect } from "react";
import { useSelector } from "react-redux";
import SearchForm from "../SearchForm";
import NovelList from "../NovelList";
import { BookSearchParams } from "@/services/SearchRequest";
import { RootState } from "@/redux/store";
import { useAppDispatch } from "@/redux/hooks";
import {
    resetBooks,
    searchBooks,
    setSearchParams,
} from "@/redux/slices/booksSlice";
import { NotificationInstance } from "antd/es/notification/interface";

// 创建一个通知上下文
export const NotificationContext = createContext<{
    api: NotificationInstance | null;
}>({ api: null });

// 替换原有的 ModalContext
export const ModalContext = createContext<unknown>(null);

const Main = () => {
    const dispatch = useAppDispatch();
    const [notificationApi, contextHolder] = notification.useNotification();
    const { books, loading, hasMore, searchParams, error } = useSelector(
        (state: RootState) => state.books
    );

    // 初始加载
    useEffect(() => {
        // 修复：正确地dispatch searchBooks action
        dispatch(searchBooks(searchParams));
    }, []); // 只在组件挂载时执行一次

    // 处理搜索表单提交
    const handleSearch = (values: Partial<BookSearchParams>) => {
        dispatch(resetBooks()); // 重置书籍列表
        const newParams = {
            ...searchParams,
            ...values,
            curr: 1, // 重置到第一页
        };
        dispatch(setSearchParams(newParams));
        // 修复：使用dispatch执行搜索
        dispatch(searchBooks(newParams));
    };

    // 加载更多数据
    const loadMoreData = () => {
        if (loading || !hasMore) return;

        const nextPage = searchParams.curr + 1;
        const newParams = {
            ...searchParams,
            curr: nextPage,
        };

        // 修复：完成loadMoreData函数实现
        dispatch(setSearchParams(newParams));
        dispatch(searchBooks(newParams));
    };

    // 显示错误消息
    useEffect(() => {
        if (error) {
            message.error(error);
        }
    }, [error]);

    return (
        <NotificationContext.Provider value={{ api: notificationApi }}>
            {contextHolder}
            <Layout.Content
                style={{
                    maxWidth: "50rem",
                    width: "100%",
                    padding: "24px",
                    margin: "0 auto",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <SearchForm onSearch={handleSearch} />
                <Divider />
            </Layout.Content>
            <NovelList
                books={books}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={loadMoreData}
                emptyText={loading ? "加载中..." : "没有找到相关小说"}
            />
        </NotificationContext.Provider>
    );
};

export default Main;
