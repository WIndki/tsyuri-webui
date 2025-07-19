import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Book } from "@/types/book";
import {
    BookSearchParams,
    getBookSearchServiceInstance,
    BookSearchService, // 导入 BookSearchService
} from "@/services/SearchRequest";

/**
 * BooksState 接口定义了书籍状态的数据结构
 * @interface BooksState
 * @property {Book[]} books - 书籍列表
 * @property {boolean} loading - 加载状态
 * @property {boolean} hasMore - 是否还有更多数据
 * @property {number} totalCount - 总数据条数
 * @property {BookSearchParams} searchParams - 搜索参数
 * @property {string | null} error - 错误信息
 */
interface BooksState {
    books: Book[];
    loading: boolean;
    hasMore: boolean;
    totalCount: number;
    searchParams: BookSearchParams;
    error: string | null;
    lastSuccessfulPage: number | null; // 用于跟踪最后一次成功加载的页码
}

const initialState: BooksState = {
    books: [],
    loading: false,
    hasMore: true,
    totalCount: 0,
    searchParams: {
        curr: 1,
        limit: 20,
        sort: "last_index_update_time",
        keyword: "",
        // ...其他搜索参数
    },
    error: null,
    lastSuccessfulPage: null,
};

// 异步Thunk - 无限滚动模式
export const searchBooks = createAsyncThunk(
    "books/searchBooks",
    async (params: BookSearchParams, { rejectWithValue }) => {
        try {
            const BookSearchServiceInstance = getBookSearchServiceInstance();
            const response = await BookSearchServiceInstance.searchBooks(
                params
            );
            return response;
        } catch (error) {
            // 使用 rejectWithValue 返回错误信息
            // 如果 error 是一个 Error 对象，返回其 message
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            // 否则，返回一个通用错误消息
            return rejectWithValue("发生未知错误");
        }
    }
);

// 异步Thunk - 分页模式
export const searchBooksWithPagination = createAsyncThunk(
    "books/searchBooksWithPagination",
    async (params: BookSearchParams, { rejectWithValue }) => {
        try {
            const BookSearchServiceInstance = getBookSearchServiceInstance();
            const response = await BookSearchServiceInstance.searchBooks(
                params
            );
            return response;
        } catch (error) {
            if (error instanceof Error) {
                return rejectWithValue(error.message);
            }
            return rejectWithValue("发生未知错误");
        }
    }
);

export const booksSlice = createSlice({
    name: "books",
    initialState,
    reducers: {
        resetBooks: (state) => {
            state.books = [];
            state.hasMore = true;
            state.totalCount = 0;
            state.error = null;
            state.lastSuccessfulPage = null;
            state.searchParams = {
                curr: 1,
                limit: 20,
                sort: "last_index_update_time",
                keyword: "",
                // ...其他搜索参数
            };
        },
        setSearchParams: (
            state,
            action: PayloadAction<Partial<BookSearchParams>>
        ) => {
            state.searchParams = { ...state.searchParams, ...action.payload };
        },
        setDisplayModeReset: (state) => {
            // 当切换显示模式时，重置到第一页
            state.searchParams.curr = 1;
            state.books = [];
            state.hasMore = true;
            state.totalCount = 0;
            state.error = null;
            state.lastSuccessfulPage = null;
        },
        setUrlParams: (state) => {
            // 确保 curr 和 limit 是数字类型
            if (
                state.searchParams.curr &&
                typeof state.searchParams.curr === "string"
            ) {
                state.searchParams.curr = parseInt(state.searchParams.curr, 10);
            }
            if (
                state.searchParams.limit &&
                typeof state.searchParams.limit === "string"
            ) {
                state.searchParams.limit = parseInt(
                    state.searchParams.limit,
                    10
                );
            }
            // 确保 curr 和 limit 有默认值，如果它们变为 NaN 或 undefined
            if (
                isNaN(state.searchParams.curr) ||
                state.searchParams.curr === undefined
            ) {
                state.searchParams.curr = initialState.searchParams.curr;
            }
            if (
                isNaN(state.searchParams.limit) ||
                state.searchParams.limit === undefined
            ) {
                state.searchParams.limit = initialState.searchParams.limit;
            }

            if (typeof window !== "undefined") {
                const queryString = BookSearchService.paramsToQueryString(
                    state.searchParams
                );
                const newPath =
                    "/search" + (queryString ? `?${queryString}` : "");
                window.history.pushState(null, "", newPath);
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchBooks.pending, (state) => {
                state.loading = true;
                state.error = null; // 清除之前的错误
            })
            .addCase(searchBooks.fulfilled, (state, action) => {
                const { list, total, pageNum, pageSize } = action.payload.data;
                const params = parseInt(pageNum);
                const totalSize = parseInt(pageSize);
                const totalCount = parseInt(total);
                
                // 更新总数
                state.totalCount = totalCount;
                
                // 在分页模式下，总是替换数据；在无限滚动模式下，第一页替换，其他页追加
                // 这里我们通过检查当前页是否为1来判断
                if (params === 1) {
                    state.books = list;
                } else {
                    // 对于无限滚动模式，追加数据
                    state.books = [...state.books, ...list];
                }

                // 判断是否还有更多数据
                if (params * totalSize >= totalCount) {
                    state.hasMore = false; // 没有更多数据
                } else {
                    state.hasMore = true; // 还有更多数据
                }

                state.loading = false;
            })
            .addCase(searchBooks.rejected, (state, action) => {
                state.loading = false;
                // 从 action.payload 获取错误信息（通过 rejectWithValue 传递）
                state.error =
                    (action.payload as string) || "搜索失败，请稍后重试";
            })
            // 分页模式的处理
            .addCase(searchBooksWithPagination.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchBooksWithPagination.fulfilled, (state, action) => {
                const { list, total, pageNum, pageSize } = action.payload.data;
                const params = parseInt(pageNum);
                const totalSize = parseInt(pageSize);
                const totalCount = parseInt(total);
                
                // 分页模式下总是替换数据
                state.books = list;
                state.totalCount = totalCount;
                state.lastSuccessfulPage = params; // 记录成功加载的页码
                
                // 判断是否还有更多数据
                if (params * totalSize >= totalCount) {
                    state.hasMore = false;
                } else {
                    state.hasMore = true;
                }

                state.loading = false;
            })
            .addCase(searchBooksWithPagination.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    (action.payload as string) || "搜索失败，请稍后重试";
            });
    },
});

// 导出 Actions
export const { resetBooks, setSearchParams, clearError, setUrlParams, setDisplayModeReset } =
    booksSlice.actions;

// 导出 Reducer
export default booksSlice.reducer;
