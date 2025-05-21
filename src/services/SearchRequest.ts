import axios from "axios";
import { Book } from "../types/book";

// 搜索请求参数接口
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

// 搜索结果数据接口
export interface BookSearchData {
    pageNum: string;
    pageSize: string;
    total: string;
    list: Book[]; // 使用导入的Book类型
}

// API响应接口
export interface ApiResponse<T> {
    code: string;
    msg: string;
    data: T;
}

// 搜索书籍服务
export class BookSearchService {
    private baseUrl: string;

    constructor(baseUrl: string = "https://tsyuri.windki.asia/api") {
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
            console.log("请求参数:", params);
            // 添加所有非空参数
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    queryParams.append(key, value.toString());
                }
            });
            console.log("请求参数:", queryParams.toString());

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
