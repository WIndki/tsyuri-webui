"use client";
import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib";
import { initializeFromUrl, startPopstateListener } from "@/lib/features/router/routerSlice";

/**
 * RouteInitializer组件的自定义Hook，包含所有业务逻辑
 * @returns 包含路由初始化处理逻辑的对象
 */
export const useRouteInitializer = () => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * 初始化路由状态
   */
  const initializeRouteState = useCallback(() => {
    // 初始化路由状态
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
      console.log("🔗 RouteInitializer: 初始化路由状态", { pathname, params });
    }
    
    dispatch(initializeFromUrl({
      pathname,
      params
    }));
  }, []);

  /**
   * 启动浏览器事件监听
   */
  const startBrowserEventListener = useCallback(() => {
    // 启动 popstate 监听器
    dispatch(startPopstateListener());
  }, [dispatch]);

  /**
   * 处理路由初始化
   */
  const processRouteInitialization = useCallback(() => {
    initializeRouteState();
    startBrowserEventListener();
  }, [initializeRouteState, startBrowserEventListener]);

  return {
    processRouteInitialization
  };
};
