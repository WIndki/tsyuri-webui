import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Book } from "@/types/book";
import {
    BookSearchParams,
    getBookSearchServiceInstance,
} from "@/services/SearchRequest";

// 初始状态
interface BooksState {
    books: Book[];
    loading: boolean;
    hasMore: boolean;
    searchParams: BookSearchParams;
    error: string | null;
}

const initialState: BooksState = {
    books: [],
    loading: false,
    hasMore: true,
    searchParams: {
        curr: 1,
        limit: 20,
        sort: "last_index_update_time",
        keyword: "",
        // ...其他搜索参数
    },
    error: null,
};

// 异步Thunk
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

export const booksSlice = createSlice({
    name: "books",
    initialState,
    reducers: {
        resetBooks: (state) => {
            state.books = [];
            state.hasMore = true;
            state.error = null;
        },
        setSearchParams: (
            state,
            action: PayloadAction<Partial<BookSearchParams>>
        ) => {
            state.searchParams = { ...state.searchParams, ...action.payload };
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
                // 如果是第一页，替换全部数据，否则追加
                if (params === 1) {
                    state.books = list;
                } else {
                    state.books = [...state.books, ...list];
                }

                // 判断是否还有更多数据
                if (params * totalSize >= parseInt(total)) {
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
            });
    },
});

// 导出 Actions
export const { resetBooks, setSearchParams, clearError } = booksSlice.actions;

// 导出 Reducer
export default booksSlice.reducer;
