"use client";
import { App } from "antd";
import React, { useEffect } from "react";
import NovelList from "../NovelList";
import { RootState } from "@/redux/store";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useSearchParams as getUrlParams } from "next/navigation";
import {
    clearError,
    resetBooks,
    searchBooks,
    setSearchParams,
} from "@/redux/slices/booksSlice"; // 导入 setSearchParams
import Content from "../Content";
import { BookSearchParams, BookSearchService } from "@/services/SearchRequest"; // 导入 BookSearchService
import ForwardEventListener from "@/utils/ForwardEventListener";

const Main = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("Main render");
    }
    const { notification } = App.useApp();
    const dispatch = useAppDispatch();
    const { loading, searchParams, error } = useAppSelector(
        (state: RootState) => state.books
    );
    const urlParams = getUrlParams();
    const forwardEventListener = ForwardEventListener();

    // 初始加载：解析URL参数并搜索
    useEffect(() => {
        let newParams: BookSearchParams = { ...searchParams };
        if (urlParams !== null) {
            const queryString = urlParams.toString(); // 获取当前URL的查询字符串
            if (queryString) {
                dispatch(resetBooks()); // 重置书籍列表
                // 如果有查询字符串，解析它并更新 Redux 状态
                const paramsFromUrl =
                    BookSearchService.queryStringToParams(queryString);
                newParams = {
                    ...paramsFromUrl,
                    curr: 1, // 重置当前页码
                    limit: 20, // 每页显示20本书
                };
            }
        }
        dispatch(setSearchParams(newParams)); // 更新 Redux 状态和 URL
        dispatch(searchBooks(newParams));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forwardEventListener]);

    // 显示错误消息
    useEffect(() => {
        if (error) {
            notification?.error({
                message: "错误",
                description: error,
                placement: "topRight",
                duration: 5,
                // 点击关闭按钮后清除错误状态
                onClose: () => dispatch(clearError()),
            });
        }
    }, [error, dispatch, notification]);

    return (
        <>
            <Content>
                <NovelList
                    emptyText={loading ? "加载中..." : "没有找到相关小说"}
                />
            </Content>
        </>
    );
};
Main.displayName = "Main"; // 设置组件名称，便于调试

export default Main;
