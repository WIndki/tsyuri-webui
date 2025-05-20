import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "@/redux/slices/themeSlice";
import booksReducer from "@/redux/slices/booksSlice";

export const store = configureStore({
    reducer: {
        theme: themeReducer,
        books: booksReducer,
    },
});

// 从 store 自身推断出 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
