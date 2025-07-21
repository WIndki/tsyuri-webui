// Store
export { store } from "./store";
export type { RootState, AppDispatch } from "./store";

// Provider
export { StoreProvider } from "./provider";

// Hooks
export { useAppDispatch, useAppSelector } from "./hooks";
export { useInfiniteBooks, usePaginatedBooks, useLazyBooks } from "./hooks/useBooks";
export { useErrorHandler, useAutoErrorHandler } from "./hooks/useErrorHandler";

// Components
export { ErrorBoundary, withErrorBoundary, useErrorBoundary } from "./components/ErrorBoundary";

// API
export { bookApi, useSearchBooksQuery, useLazySearchBooksQuery } from "./api/bookApi";
export type { BookSearchParams, BookSearchData, ApiResponse } from "./api/bookApi";
export { decodeParam, encodeParam, paramsToQueryString, queryStringToParams } from "./api/bookApi";

// Theme
export { 
    toggleTheme, 
    setTheme, 
    toggleDisplayMode, 
    setDisplayMode,
    selectThemeMode,
    selectDisplayMode 
} from "./features/theme/themeSlice";
export type { ThemeMode, DisplayMode } from "./features/theme/themeSlice";

// Search
export {
    setSearchParams,
    resetSearchParams,
    setCurrentPage,
    incrementPage,
    rollbackToLastSuccessfulState,
    resetToFirstPage,
    initializeFromRouter,
    selectSearchParams,
    selectCurrentPage,
    selectLastSuccessfulState
} from "./features/search/searchSlice";

// Router
export {
    initializeFromUrl,
    syncToUrl,
    updateParams,
    setShouldSyncToUrl,
    setCurrentPath,
    resetRouterState,
    startPopstateListener,
    selectCurrentPath,
    selectIsInitialized,
    selectShouldSyncToUrl,
    selectParams,
    selectUrlSearchParams,
} from "./features/router/routerSlice";
