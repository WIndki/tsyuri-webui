import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import type { TypedStartListening } from "@reduxjs/toolkit";
import { bookApi } from "./api/bookApi";
import themeReducer from "./features/theme/themeSlice";
import searchReducer, { searchListenerMiddleware } from "./features/search/searchSlice";
import routerReducer, { routerListenerMiddleware } from "./features/router/routerSlice";

export const store = configureStore({
    reducer: {
        // RTK Query API slice
        [bookApi.reducerPath]: bookApi.reducer,
        // Regular slices
        theme: themeReducer,
        search: searchReducer,
        router: routerReducer,
    },
    // 添加RTK Query的中间件和监听器中间件
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(bookApi.middleware)
            .prepend(routerListenerMiddleware.middleware)
            .prepend(searchListenerMiddleware.middleware),
});

// 设置监听器以启用refetchOnFocus/refetchOnReconnect行为
setupListeners(store.dispatch);

// 从 store 自身推断出 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
