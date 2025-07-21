# 新的 Redux 架构说明

## 文件结构

```
src/lib/
├── index.ts                    # 统一导出所有 API
├── store.ts                    # Redux store 配置
├── hooks.ts                    # 基础类型化 hooks
├── provider.tsx                # Redux Provider 组件
├── api/
│   └── bookApi.ts             # RTK Query API 切片
├── features/
│   ├── theme/
│   │   └── themeSlice.ts      # 主题状态管理
│   └── search/
│       └── searchSlice.ts     # 搜索参数状态管理
└── hooks/
    └── useBooks.ts            # 自定义书籍相关 hooks
```

## 核心特性

### 1. RTK Query API (bookApi.ts)

- 自动生成的 hooks: `useSearchBooksQuery`, `useLazySearchBooksQuery`
- 内置缓存、错误处理、重试机制
- 自动管理加载状态

### 2. Feature Slices

#### Theme Slice
- 管理主题模式 (light/dark)
- 管理显示模式 (infinite/pagination)
- 自动同步到 localStorage

#### Search Slice
- 管理搜索参数
- 页码管理
- URL 同步

### 3. 自定义 Hooks

#### useInfiniteBooks()
- 无限滚动模式
- 自动累加书籍列表
- 智能加载更多

#### usePaginatedBooks()
- 分页模式
- 页码管理
- 页面切换

#### useLazyBooks()
- 手动触发搜索
- 适用于按需搜索场景

## 使用示例

### 基本搜索
```typescript
import { useInfiniteBooks } from "@/lib";

function BookList() {
    const { books, isLoading, hasMore, loadMore, error } = useInfiniteBooks();
    
    return (
        <div>
            {books.map(book => <BookCard key={book.id} book={book} />)}
            {hasMore && <button onClick={loadMore}>加载更多</button>}
        </div>
    );
}
```

### 分页搜索
```typescript
import { usePaginatedBooks } from "@/lib";

function BookList() {
    const { books, currentPage, totalCount, changePage } = usePaginatedBooks();
    
    return (
        <div>
            {books.map(book => <BookCard key={book.id} book={book} />)}
            <Pagination 
                current={currentPage} 
                total={totalCount}
                onChange={changePage}
            />
        </div>
    );
}
```

### 搜索参数管理
```typescript
import { useAppDispatch, setSearchParams } from "@/lib";

function SearchForm() {
    const dispatch = useAppDispatch();
    
    const handleSearch = (keyword: string) => {
        dispatch(setSearchParams({ keyword, curr: 1 }));
    };
    
    return <SearchInput onSearch={handleSearch} />;
}
```

### 主题管理
```typescript
import { useAppSelector, useAppDispatch, selectThemeMode, toggleTheme } from "@/lib";

function ThemeToggle() {
    const mode = useAppSelector(selectThemeMode);
    const dispatch = useAppDispatch();
    
    return (
        <button onClick={() => dispatch(toggleTheme())}>
            {mode === 'light' ? '🌙' : '☀️'}
        </button>
    );
}
```

## 优势

1. **性能优化**: RTK Query 自动缓存和去重
2. **代码简化**: hooks 抽象了复杂的状态逻辑
3. **类型安全**: 完整的 TypeScript 支持
4. **错误处理**: 内置错误处理和重试
5. **开发体验**: 更好的 DevTools 支持
