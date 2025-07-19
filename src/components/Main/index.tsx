"use client";
import { App, Spin } from "antd";
import React, { Suspense, useEffect } from "react";
import NovelList from "../NovelList";
import { RootState } from "@/redux/store";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useSearchParams as getUrlParams } from "next/navigation";
import {
    resetBooks,
    searchBooks,
    searchBooksWithPagination,
    setSearchParams,
    setDisplayModeReset,
} from "@/redux/slices/booksSlice";
import Content from "../Content";
import { BookSearchParams, BookSearchService } from "@/services/SearchRequest";
import ForwardEventListener from "@/utils/ForwardEventListener";
import SearchForm from "../SearchForm";
import Toolbar from "../Toolbar";

// 创建内部组件来使用 useSearchParams
const MainContent = () => {
    const dispatch = useAppDispatch();
    const { loading, searchParams } = useAppSelector(
        (state: RootState) => state.books
    );
    const { displayMode } = useAppSelector((state: RootState) => state.theme);
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
        // 根据显示模式使用不同的搜索action
        if (displayMode === "pagination") {
            dispatch(searchBooksWithPagination(newParams));
        } else {
            dispatch(searchBooks(newParams));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [forwardEventListener]);

    // 监听显示模式变化
    useEffect(() => {
        // 当显示模式改变时，重置数据并重新搜索
        dispatch(setDisplayModeReset());
        const newParams = { ...searchParams, curr: 1 };
        dispatch(setSearchParams(newParams));
        // 根据显示模式使用不同的搜索action
        if (displayMode === "pagination") {
            dispatch(searchBooksWithPagination(newParams));
        } else {
            dispatch(searchBooks(newParams));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayMode]);

    // 显示错误消息 - 现在由各个子组件处理，这里移除
    // useEffect(() => {
    //     if (error) {
    //         notification?.error({
    //             message: "错误",
    //             description: error,
    //             placement: "topRight",
    //             duration: 5,
    //             // 点击关闭按钮后清除错误状态
    //             onClose: () => dispatch(clearError()),
    //         });
    //     }
    // }, [error, dispatch, notification]);

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

// 主组件，用Suspense包裹内部组件
const Main = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("Main render");
    }

    return (
        <>
            <Suspense
                fallback={
                    <div style={{ margin: "0 auto" }}>
                        <Spin size="large" />
                    </div>
                }
            >
                <MainContent />
            </Suspense>
            <SearchForm />
            <Toolbar />
        </>
    );
};

Main.displayName = "Main"; // 设置组件名称，便于调试

export default Main;
