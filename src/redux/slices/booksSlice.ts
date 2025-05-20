import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Book } from "@/types/book";
import {
    BookSearchParams,
    getBookSearchServiceInstance,
} from "@/services/SearchRequest";

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
    },
    error: null,
};

export const searchBooks = createAsyncThunk(
    "books/searchBooks",
    async (params: BookSearchParams, { rejectWithValue }) => {
        try {
            const BookSearchServiceInstance = getBookSearchServiceInstance();
            const response = await BookSearchServiceInstance.searchBooks(
                params
            );

            if (response.code === "200") {
                console.log("搜索书籍成功:", response.data);
                return {
                    list: response.data.list,
                    total: response.data.total,
                    params,
                };
            } else {
                return rejectWithValue(response.msg || "获取数据失败");
            }
        } catch (error) {
            return rejectWithValue(
                (error as Error).message || "搜索书籍失败，请稍后再试"
            );
        }
    }
);

export const booksSlice = createSlice({
    name: "books",
    initialState,
    reducers: {
        setSearchParams: (
            state,
            action: PayloadAction<Partial<BookSearchParams>>
        ) => {
            state.searchParams = { ...state.searchParams, ...action.payload };
        },
        resetBooks: (state) => {
            state.books = [];
            state.hasMore = true;
            state.searchParams.curr = 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchBooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchBooks.fulfilled, (state, action) => {
                const { list, total, params } = action.payload;

                // 如果是第一页，替换全部数据，否则追加
                if (params.curr === 1) {
                    state.books = list;
                } else {
                    // 避免重复数据
                    const newBooks = list.filter(
                        (newBook) =>
                            !state.books.find((book) => book.id === newBook.id)
                    );
                    state.books = [...state.books, ...newBooks];
                }

                // 判断是否还有更多数据
                const totalPages = Math.ceil(parseInt(total) / params.limit);
                state.hasMore = params.curr < totalPages;

                state.loading = false;
                state.searchParams = params;
            })
            .addCase(searchBooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSearchParams, resetBooks } = booksSlice.actions;

export default booksSlice.reducer;
