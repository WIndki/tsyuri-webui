import { createSlice, PayloadAction, createListenerMiddleware, Dispatch } from "@reduxjs/toolkit";
import { initializeFromRouter } from "../search/searchSlice";

/**
 * 路由状态接口 - 通用路由管理
 */
interface RouterState {
    currentPath: string;
    params: Record<string, string>;
    isInitialized: boolean;
    shouldSyncToUrl: boolean;
}

const initialState: RouterState = {
    currentPath: "/",
    params: {},
    isInitialized: false,
    shouldSyncToUrl: true,
};

/**
 * 路由同步 Slice
 */
export const routerSlice = createSlice({
    name: "router",
    initialState,
    reducers: {
        setInitialized: (state, action: PayloadAction<boolean>) => {
            state.isInitialized = action.payload;
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔗 Router: 设置初始化状态", action.payload)
            }
        },

        // 初始化路由状态（从 URL 解析）
        initializeFromUrl: (state, action: PayloadAction<{ pathname: string; params: Record<string, string> }>) => {
            const { pathname, params } = action.payload;
            state.currentPath = pathname;
            state.params = params;
            state.isInitialized = true;
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔗 Router: 初始化路由状态", { pathname, params });
            }
        },

        // 同步状态到 URL - 通用方法
        syncToUrl: (state, action: PayloadAction<{ path: string; params?: Record<string, string>; replace?: boolean }>) => {
            if (!state.shouldSyncToUrl) return;

            const { path, params = {}, replace = false } = action.payload;
            const queryString = new URLSearchParams(params).toString();
            const newPath = queryString ? `${path}?${queryString}` : path;

            state.currentPath = newPath;
            state.params = params;

            if (typeof window !== "undefined") {
                const method = replace ? "replaceState" : "pushState";
                window.history[method](null, "", newPath);

                if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                    console.log(`🔗 Router: ${replace ? '替换' : '推送'} URL`, { newPath, params });
                }
            }
        },

        // 更新参数（不触发导航）
        updateParams: (state, action: PayloadAction<Record<string, string>>) => {
            state.params = { ...state.params, ...action.payload };

            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔗 Router: 更新参数", action.payload);
            }
        },

        // 启用/禁用 URL 同步
        setShouldSyncToUrl: (state, action: PayloadAction<boolean>) => {
            state.shouldSyncToUrl = action.payload;

            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔗 Router: 设置 URL 同步状态", action.payload);
            }
        },

        // 手动更新当前路径
        setCurrentPath: (state, action: PayloadAction<string>) => {
            state.currentPath = action.payload;
        },

        // 重置路由状态
        resetRouterState: (state) => {
            state.currentPath = "/";
            state.params = {};
            state.isInitialized = false;
        },

        // 启动 popstate 监听器的 action
        startPopstateListener: () => {
            // 这是一个标记 action，实际的监听器在中间件中处理
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔗 Router: 请求启动 popstate 监听器");
            }
        },
    },
});

export const {
    setInitialized,
    initializeFromUrl,
    syncToUrl,
    updateParams,
    setShouldSyncToUrl,
    setCurrentPath,
    resetRouterState,
    startPopstateListener,
} = routerSlice.actions;

// Selectors
export const selectCurrentPath = (state: { router: RouterState }) => state.router.currentPath;
export const selectIsInitialized = (state: { router: RouterState }) => state.router.isInitialized;
export const selectShouldSyncToUrl = (state: { router: RouterState }) => state.router.shouldSyncToUrl;
export const selectParams = (state: { router: RouterState }) => state.router.params;
export const selectUrlSearchParams = (state: { router: RouterState }) => {
    return new URLSearchParams(state.router.params);
};

// 创建监听器中间件用于路由同步
export const routerListenerMiddleware = createListenerMiddleware();

// 监听路由初始化，根据路径初始化相应的状态
routerListenerMiddleware.startListening({
    actionCreator: initializeFromUrl,
    effect: (action, listenerApi) => {
        const { pathname, params } = action.payload;
        
        // 根据路径初始化相应的 slice 状态
        switch (pathname) {
            case "/search":
                listenerApi.dispatch(initializeFromRouter(params));
                
                break;
            default:
                // 其他路径不需要特殊处理
                break;
        }
        // listenerApi.dispatch(setInitialized(true));
        
        if (process.env.NEXT_PUBLIC_DEBUG === "true") {
            console.log("🔗 Router Listener: 根据路径初始化状态", { pathname, params });
        }
    },
});

// 监听 startPopstateListener action 来添加浏览器事件监听器
routerListenerMiddleware.startListening({
    actionCreator: startPopstateListener,
    effect: (action, listenerApi) => {
        addPopstateListener(listenerApi.dispatch);
    },
});

// 浏览器前进/后退事件监听器
let popstateListenerAdded = false;

export const addPopstateListener = (dispatch: Dispatch) => {
    if (typeof window === "undefined" || popstateListenerAdded) return;

    const handlePopstate = () => {
        const url = new URL(window.location.href);
        const searchParams = url.searchParams;

        if (process.env.NEXT_PUBLIC_DEBUG === "true") {
            console.log("🔗 Router: 检测到浏览器前进/后退", {
                pathname: url.pathname,
                search: searchParams.toString()
            });
        }

        // 禁用自动同步，防止循环
        dispatch(setShouldSyncToUrl(false));

        // 将 URLSearchParams 转换为普通对象
        const searchParamsObject: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            searchParamsObject[key] = value;
        });

        // 更新路由状态
        dispatch(initializeFromUrl({
            pathname: url.pathname,
            params: searchParamsObject
        }));

        // 重新启用自动同步
        setTimeout(() => {
            dispatch(setShouldSyncToUrl(true));
        }, 100);
    };

    window.addEventListener("popstate", handlePopstate);
    popstateListenerAdded = true;

    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("🔗 Router: 添加 popstate 事件监听器");
    }
};

export default routerSlice.reducer;

