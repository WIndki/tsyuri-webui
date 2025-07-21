import { createSlice, PayloadAction, createListenerMiddleware, UnknownAction, ThunkDispatch, ListenerEffectAPI } from "@reduxjs/toolkit";
import { BookSearchParams, queryStringToParams } from "@/lib/api/bookApi";
import { RootState } from "@/lib";
import { syncToUrl } from "../router/routerSlice";

/**
 * 清理搜索参数，移除无效值
 */
function cleanSearchParams(params: Partial<BookSearchParams>): Record<string, string> {
    const cleaned: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined &&
            value !== null &&
            value !== "" &&
            String(value).trim() !== "" &&
            String(value) !== "undefined") {
            cleaned[key] = String(value);
        }
    });

    return cleaned;
}

/**
 * SearchState 接口定义了搜索状态的数据结构
 */
interface SearchState {
    searchParams: BookSearchParams;
    lastSuccessfulState: BookSearchParams | null; // 保存上一次成功的搜索状态
}

const initialSearchParams: BookSearchParams = {
    curr: 1,
    limit: 20,
    sort: "last_index_update_time",
    keyword: "",
    // 明确设置其他可选字段为 undefined，避免在序列化时出现问题
    bookStatus: undefined,
    wordCountMin: undefined,
    wordCountMax: undefined,
    updatePeriod: undefined,
    purity: undefined,
    tag: undefined,
    source: undefined,
};

const initialState: SearchState = {
    searchParams: initialSearchParams,
    lastSuccessfulState: null,
};

const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        setSearchParams: (
            state,
            action: PayloadAction<Partial<BookSearchParams>>
        ) => {
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔍 Search: 设置搜索参数", action.payload);
            }
            state.searchParams = { ...state.searchParams, ...action.payload };
        },
        resetSearchParams: (state) => {
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔍 Search: 重置搜索参数");
            }
            state.searchParams = initialSearchParams;
            state.lastSuccessfulState = null;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔍 Search: 设置当前页", action.payload);
            }
            state.searchParams.curr = action.payload;
        },
        incrementPage: (state) => {
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔍 Search: 增加页码");
            }
            state.searchParams.curr += 1;
        },
        // 保存成功的搜索状态
        saveSuccessfulState: (state) => {
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔍 Search: 保存成功状态", state.searchParams);
            }
            state.lastSuccessfulState = JSON.parse(JSON.stringify(state.searchParams));
        },
        // 回滚到上一次成功的状态
        rollbackToLastSuccessfulState: (state) => {
            if (state.lastSuccessfulState) {
                if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                    console.log("🔍 Search: 回滚到上次成功状态", state.lastSuccessfulState);
                }
                state.searchParams = JSON.parse(JSON.stringify(state.lastSuccessfulState));
            } else {
                if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                    console.log("🔍 Search: 没有可回滚的状态，重置到初始状态");
                }
                state.searchParams = initialSearchParams;
            }
        },
        resetToFirstPage: (state) => {
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔍 Search: 重置到第一页");
            }
            state.searchParams.curr = 1;
        },

        // 从路由状态初始化搜索参数（仅限 /search 路径）
        initializeFromRouter: (state, action: PayloadAction<Record<string, string>>) => {
            const routerParams = action.payload;

            // 将 URL 参数转换为搜索参数
            const searchParams = queryStringToParams(new URLSearchParams(routerParams).toString());

            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("🔍 Search: 从路由初始化", { routerParams, searchParams });
            }

            state.searchParams = {
                ...initialSearchParams,
                ...searchParams,
            };
        },
    },
});

export const {
    setSearchParams,
    resetSearchParams,
    setCurrentPage,
    incrementPage,
    saveSuccessfulState,
    rollbackToLastSuccessfulState,
    resetToFirstPage,
    initializeFromRouter,
} = searchSlice.actions;

export const selectSearchParams = (state: RootState) => state.search.searchParams;
export const selectCurrentPage = (state: RootState) => state.search.searchParams.curr;
export const selectLastSuccessfulState = (state: RootState) => state.search.lastSuccessfulState;

// 创建搜索监听器中间件
export const searchListenerMiddleware = createListenerMiddleware();

// 监听搜索参数变化，仅在路径下同步到 URL
const syncSearchParamsEffect = (action: UnknownAction, listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>) => {
    const state = listenerApi.getState() as RootState;
    const searchParams = state.search.searchParams;

    // 清理搜索参数
    const cleanedParams = cleanSearchParams(searchParams);

    // 同步到路由
    listenerApi.dispatch(syncToUrl({
        path: "/search",
        params: cleanedParams,
        replace: false
    }));

    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("🔍 Search: 同步搜索参数到 URL", { searchParams, cleanedParams });
    }
};

searchListenerMiddleware.startListening({
    actionCreator: setSearchParams,
    effect: syncSearchParamsEffect,
});

searchListenerMiddleware.startListening({
    actionCreator: resetSearchParams,
    effect: syncSearchParamsEffect,
});

searchListenerMiddleware.startListening({
    actionCreator: setCurrentPage,
    effect: syncSearchParamsEffect,
});

searchListenerMiddleware.startListening({
    actionCreator: incrementPage,
    effect: syncSearchParamsEffect,
});

searchListenerMiddleware.startListening({
    actionCreator: resetSearchParams,
    effect: syncSearchParamsEffect,
});


export default searchSlice.reducer;
