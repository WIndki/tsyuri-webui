import { createApi, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { Book } from "@/types/book";

/**
 * 搜索请求参数接口，定义了书籍搜索时需要的各种参数
 */
export interface BookSearchParams {
    curr: number; // 当前页码
    limit: number; // 每页限制
    bookStatus?: string; // 书籍状态
    wordCountMin?: string; // 最小字数
    wordCountMax?: string; // 最大字数
    sort?: string; // 排序方式
    updatePeriod?: string; // 更新周期
    purity?: string; // 纯度
    keyword?: string; // 关键词
    tag?: string; // 标签
    source?: string; // 来源
}

/**
 * 搜索结果数据接口
 */
export interface BookSearchData {
    pageNum: string;
    pageSize: string;
    total: string;
    list: Book[];
}

/**
 * API响应接口
 */
export interface ApiResponse<T> {
    code: string;
    msg: string;
    data: T;
}

/**
 * API错误接口
 */
export interface ApiError {
    code?: string;
    msg?: string;
    error?: string;
    status?: number;
    statusText?: string;
}

/**
 * 错误处理的基础查询包装器
 */
const baseQueryWithErrorHandling = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/json");
        headers.set("Accept", "application/json");
        return headers;
    },
    // 允许跨域请求
    credentials: "include",
    timeout: 10000,
});

/**
 * 获取用户友好的错误信息
 */
export function getUserFriendlyErrorMessage(error: FetchBaseQueryError): string {
    let errorMessage = "网络请求失败";
    
    if (error.status === 'FETCH_ERROR') {
        errorMessage = "网络连接失败，请检查您的网络连接";
    } else if (error.status === 'TIMEOUT_ERROR') {
        errorMessage = "请求超时，请稍后重试";
    } else if (error.status === 'PARSING_ERROR') {
        errorMessage = "数据解析失败";
    } else if (typeof error.status === 'number') {
        switch (error.status) {
            case 400:
                errorMessage = "请求参数错误";
                break;
            case 401:
                errorMessage = "未授权访问";
                break;
            case 403:
                errorMessage = "访问被拒绝";
                break;
            case 404:
                errorMessage = "请求的资源未找到";
                break;
            case 500:
                errorMessage = "服务器内部错误";
                break;
            case 502:
                errorMessage = "网关错误";
                break;
            case 503:
                errorMessage = "服务暂时不可用";
                break;
            default:
                errorMessage = `请求失败 (${error.status})`;
        }
        
        // 尝试从错误响应中提取更详细的错误信息
        if (error.data && typeof error.data === 'object') {
            const apiError = error.data as ApiError;
            if (apiError.msg) {
                errorMessage = apiError.msg;
            } else if (apiError.error) {
                errorMessage = apiError.error;
            }
        }
    }
    
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.error("API错误详情:", {
            status: error.status,
            data: error.data,
            message: errorMessage,
            originalError: error
        });
    }
    
    return errorMessage;
}

/**
 * 检查是否为业务逻辑错误
 */
export function checkBusinessError(data: unknown): { isError: boolean; message?: string } {
    if (data && typeof data === 'object') {
        const apiResponse = data as ApiResponse<unknown>;
        if (apiResponse.code && apiResponse.code !== '200' && apiResponse.code !== '0') {
            const message = apiResponse.msg || "操作失败，请稍后重试";
            
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.error("业务逻辑错误:", {
                    code: apiResponse.code,
                    message: message
                });
            }
            
            return { isError: true, message };
        }
    }
    
    return { isError: false };
}

// 定义一个服务使用基础 URL 和预期的端点
export const bookApi = createApi({
    reducerPath: "bookApi",
    baseQuery: baseQueryWithErrorHandling,
    // 标签类型，用于缓存失效
    tagTypes: ["Book"],
    endpoints: (builder) => ({
        // 查询端点：搜索书籍
        searchBooks: builder.query<ApiResponse<BookSearchData>, BookSearchParams>({
            query: (params) => {
                // 构建查询字符串
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== "") {
                        queryParams.append(key, value.toString());
                    }
                });

                if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                    console.log("RTK Query searchBooks params:", params);
                    console.log("RTK Query searchBooks queryParams:", queryParams.toString());
                }

                return {
                    url: `/book/searchByPage?${queryParams.toString()}`,
                    method: "GET",
                };
            },
            // 为缓存提供标签
            providesTags: (result, error, params) => {
                // 为每个搜索参数组合生成唯一的缓存标签
                const cacheKey = JSON.stringify(params);
                return result
                    ? [
                          ...result.data.list.map(({ id }) => ({ type: "Book" as const, id })),
                          { type: "Book", id: "LIST" },
                          { type: "Book", id: cacheKey }, // 基于参数的唯一缓存标签
                      ]
                    : [{ type: "Book", id: "LIST" }, { type: "Book", id: cacheKey }];
            },
            // 缓存配置：命中缓存后不再发起请求
            keepUnusedDataFor: 60 * 5, // 5分钟内保持缓存
            forceRefetch: ({ currentArg, previousArg }) => {
                // 只有当参数改变时才强制刷新
                return JSON.stringify(currentArg) !== JSON.stringify(previousArg);
            },
            // 序列化查询参数作为缓存键
            serializeQueryArgs: ({ queryArgs }) => {
                // 创建一个稳定的缓存键，确保相同参数使用相同缓存
                const sortedParams = Object.keys(queryArgs)
                    .sort()
                    .reduce<Record<string, string | number>>((result, key) => {
                        const value = queryArgs[key as keyof BookSearchParams];
                        if (value !== undefined && value !== null && value !== "") {
                            result[key] = value;
                        }
                        return result;
                    }, {});
                
                return JSON.stringify(sortedParams);
            },
        }),
    }),
});

// 导出自动生成的hooks用于函数组件中使用
export const { useSearchBooksQuery, useLazySearchBooksQuery } = bookApi;

/**
 * 工具函数：解码标签和来源参数
 */
export function decodeParam(encodedParam: string): string[] {
    if (!encodedParam) return [];

    return encodedParam
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "")
        .map((item) => decodeURIComponent(item));
}

/**
 * 工具函数：编码标签和来源参数
 */
export function encodeParam(params: string[]): string {
    if (!params || params.length === 0) return "";

    return params.map((item) => encodeURIComponent(item)).join(",");
}

/**
 * 工具函数：将搜索参数对象转换为 URL 查询字符串
 */
export function paramsToQueryString(params: Partial<BookSearchParams>): string {
    const queryParams = new URLSearchParams();
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            const value = params[key as keyof BookSearchParams];
            if (
                value !== undefined &&
                value !== null &&
                String(value).trim() !== ""
            ) {
                queryParams.append(key, String(value));
            }
        }
    }
    return queryParams.toString();
}

/**
 * 工具函数：将 URL 查询字符串解析为部分搜索参数对象
 */
export function queryStringToParams(queryString: string): Partial<BookSearchParams> {
    const urlParams = new URLSearchParams(queryString);
    const parsedParams: Partial<BookSearchParams> = {};

    const assignParam = (
        key: keyof BookSearchParams,
        valueStr: string | null
    ) => {
        if (valueStr === null || valueStr === undefined) return;

        if (key === "curr" || key === "limit") {
            const numValue = parseInt(valueStr, 10);
            if (!isNaN(numValue)) {
                parsedParams[key] = numValue;
            }
        } else {
            parsedParams[key] = valueStr;
        }
    };

    // 处理 BookSearchParams 中定义的每个键
    assignParam("curr", urlParams.get("curr"));
    assignParam("limit", urlParams.get("limit"));
    assignParam("bookStatus", urlParams.get("bookStatus"));
    assignParam("wordCountMin", urlParams.get("wordCountMin"));
    assignParam("wordCountMax", urlParams.get("wordCountMax"));
    assignParam("sort", urlParams.get("sort"));
    assignParam("updatePeriod", urlParams.get("updatePeriod"));
    assignParam("purity", urlParams.get("purity"));
    assignParam("keyword", urlParams.get("keyword"));
    assignParam("tag", urlParams.get("tag"));
    assignParam("source", urlParams.get("source"));

    return parsedParams;
}
