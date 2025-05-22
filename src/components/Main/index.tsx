"use client";
import { notification } from "antd";
import React, { createContext, useEffect } from "react";
import { useSelector } from "react-redux";
import SearchForm from "../SearchForm";
import NovelList from "../NovelList";
import { RootState } from "@/redux/store";
import { useAppDispatch } from "@/redux/hooks";
import { searchBooks, clearError } from "@/redux/slices/booksSlice";
import { NotificationInstance } from "antd/es/notification/interface";
import Content from "../Content";

// 创建一个通知上下文
export const NotificationContext = createContext<{
    api: NotificationInstance | null;
}>({ api: null });

// 替换原有的 ModalContext
export const ModalContext = createContext<unknown>(null);

const Main = () => {
    const dispatch = useAppDispatch();
    const [notificationApi, contextHolder] = notification.useNotification();
    const { loading, searchParams, error } = useSelector(
        (state: RootState) => state.books
    );

    // 初始加载
    useEffect(() => {
        dispatch(searchBooks(searchParams));
    }, []); // 只在组件挂载时执行一次

    // 显示错误消息
    useEffect(() => {
        if (error) {
            // 使用 notification 而不是 message 来显示更详细的错误
            notificationApi?.error({
                message: "错误",
                description: error,
                placement: "topRight",
                duration: 5,
                // 点击关闭按钮后清除错误状态
                onClose: () => dispatch(clearError()),
            });
        }
    }, [error, notificationApi, dispatch]);

    return (
        <NotificationContext.Provider value={{ api: notificationApi }}>
            {contextHolder}
            <Content>
                <NovelList
                    emptyText={loading ? "加载中..." : "没有找到相关小说"}
                />
            </Content>
            <SearchForm />
        </NotificationContext.Provider>
    );
};

export default Main;
