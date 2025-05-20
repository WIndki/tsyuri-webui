import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";

interface ThemeState {
    mode: ThemeMode;
}

// 检查本地存储中是否有保存的主题设置
const getInitialTheme = (): ThemeMode => {
    if (typeof window !== "undefined") {
        const savedTheme = localStorage.getItem("themeMode");
        if (savedTheme === "dark" || savedTheme === "light") {
            return savedTheme;
        }
    }
    return "light";
};

const initialState: ThemeState = {
    mode: getInitialTheme(),
};

export const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light";
            if (typeof window !== "undefined") {
                localStorage.setItem("themeMode", state.mode);
            }
        },
        setTheme: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("themeMode", state.mode);
            }
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
