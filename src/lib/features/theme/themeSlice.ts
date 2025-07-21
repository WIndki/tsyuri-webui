import { RootState } from "@/lib";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark";
export type DisplayMode = "infinite" | "pagination";

/**
 * ThemeState 接口定义了主题状态的数据结构
 */
interface ThemeState {
    mode: ThemeMode;
    displayMode: DisplayMode;
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

// 检查设备类型并获取初始显示模式
const getInitialDisplayMode = (): DisplayMode => {
    if (typeof window !== "undefined") {
        const savedDisplayMode = localStorage.getItem("displayMode");
        if (savedDisplayMode === "infinite" || savedDisplayMode === "pagination") {
            return savedDisplayMode;
        }
        
        // 检查是否为iOS设备
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        return isIOS ? "pagination" : "infinite";
    }
    return "infinite";
};

const initialState: ThemeState = {
    mode: getInitialTheme(),
    displayMode: getInitialDisplayMode(),
};

const themeSlice = createSlice({
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
        toggleDisplayMode: (state) => {
            state.displayMode = state.displayMode === "infinite" ? "pagination" : "infinite";
            if (typeof window !== "undefined") {
                localStorage.setItem("displayMode", state.displayMode);
            }
        },
        setDisplayMode: (state, action: PayloadAction<DisplayMode>) => {
            state.displayMode = action.payload;
            if (typeof window !== "undefined") {
                localStorage.setItem("displayMode", state.displayMode);
            }
        },
    },
});

export const { toggleTheme, setTheme, toggleDisplayMode, setDisplayMode } = themeSlice.actions;

// Selectors
export const selectThemeMode = (state: RootState) => state.theme.mode;
export const selectDisplayMode = (state: RootState) => state.theme.displayMode;

export default themeSlice.reducer;
