import axios from "axios";
import { Book } from "../types/book";

/**
 * 搜索请求参数接口，定义了书籍搜索时需要的各种参数
 * @interface BookSearchParams
 * @property {number} curr - 当前页码
 * @property {number} limit - 每页限制数量
 * @property {string} [bookStatus] - 书籍状态，可选
 * @property {string} [wordCountMin] - 最小字数，可选
 * @property {string} [wordCountMax] - 最大字数，可选
 * @property {string} [sort] - 排序方式，可选
 * @property {string} [updatePeriod] - 更新周期，可选
 * @property {string} [purity] - 纯度分类，可选
 * @property {string} [keyword] - 关键词，可选
 * @property {string} [tag] - 标签，可选
 * @property {string} [source] - 来源，可选
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
 * 搜索结果数据接口，定义了从API返回的书籍搜索结果结构
 * @interface BookSearchData
 * @property {string} pageNum - 当前页码
 * @property {string} pageSize - 每页大小
 * @property {string} total - 总记录数
 * @property {Book[]} list - 书籍列表
 */
export interface BookSearchData {
    pageNum: string;
    pageSize: string;
    total: string;
    list: Book[]; // 使用导入的Book类型
}

/**
 * API响应接口，定义了API返回的通用数据结构
 * @interface ApiResponse
 * @template T - 响应数据的类型
 * @property {string} code - 响应状态码
 * @property {string} msg - 响应消息
 * @property {T} data - 响应数据
 */
export interface ApiResponse<T> {
    code: string;
    msg: string;
    data: T;
}

// 搜索书籍服务
export class BookSearchService {
    private baseUrl: string;

    constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
        this.baseUrl = baseUrl;
    }

    /**
     * 搜索书籍
     * @param params 搜索参数
     * @returns Promise<ApiResponse<BookSearchData>>
     */
    async searchBooks(
        params: BookSearchParams
    ): Promise<ApiResponse<BookSearchData>> {
        try {
            // 构建查询字符串
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    queryParams.append(key, value.toString());
                }
            });
            if (process.env.NEXT_PUBLIC_DEBUG === "true") {
                console.log("searchBooks params:", params);
                console.log("searchBooks queryParams:", queryParams.toString());
            }

            // 发送请求
            const response = await axios.get<ApiResponse<BookSearchData>>(
                `${this.baseUrl}/book/searchByPage?${queryParams.toString()}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    // 允许跨域请求
                    withCredentials: true,
                    // 增加超时时间
                    timeout: 10000,
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 解码标签和来源参数
     * @param encodedParam 编码后的参数
     * @returns 解码后的参数数组
     */
    static decodeParam(encodedParam: string): string[] {
        if (!encodedParam) return [];

        // 分隔并解码每个参数
        return encodedParam
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "")
            .map((item) => decodeURIComponent(item));
    }

    /**
     * 编码标签和来源参数
     * @param params 参数数组
     * @returns 编码后的参数字符串
     */
    static encodeParam(params: string[]): string {
        if (!params || params.length === 0) return "";

        return params.map((item) => encodeURIComponent(item)).join(",");
    }
}

//单例
let instance: BookSearchService | null = null;
export const getBookSearchServiceInstance = (): BookSearchService => {
    if (!instance) {
        instance = new BookSearchService();
    }
    return instance;
};
