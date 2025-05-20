import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { ApiResponse, BookSearchData } from "@/services/SearchRequest";

const BASE_URL = "https://index.tsyuri.com";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // 只允许GET请求
    if (req.method !== "GET") {
        return res
            .status(405)
            .json({ code: "405", msg: "Method Not Allowed", data: null });
    }

    try {
        // 从请求中获取查询参数
        const queryParams = new URLSearchParams();

        // 添加所有查询参数
        Object.entries(req.query).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                if (Array.isArray(value)) {
                    queryParams.append(key, value[0] || "");
                } else {
                    queryParams.append(key, value.toString());
                }
            }
        });

        // 获取原始Referer参数，用于构建正确的引用地址
        const originalQuery = queryParams.toString();
        // 编码后的引用地址
        const encodedReferer = `https://index.tsyuri.com/?${originalQuery}`;

        // 发送请求到原始API，添加完整的请求头
        const response = await axios.get<ApiResponse<BookSearchData>>(
            `${BASE_URL}/book/searchByPage?${queryParams.toString()}`,
            {
                headers: {
                    // 基本头
                    "Content-Type": "application/json",
                    Accept: "application/json, text/javascript, */*; q=0.01",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language":
                        "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",

                    // 缓存控制
                    "Cache-Control": "no-cache",
                    Pragma: "no-cache",

                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",

                    // 安全与跟踪
                    DNT: "1",
                    Priority: "u=1, i",
                    Referer: encodedReferer,
                },
                // 明确指定完整URL，避免URL解析问题
                url: `${BASE_URL}/book/searchByPage?${queryParams.toString()}`,
                // 禁用代理设置
                proxy: false,
                // 增加超时时间
                timeout: 10000,
                // 显式指定responseType
                responseType: "json",
                // 允许跨域请求
                withCredentials: true,
            }
        );
        console.log("请求参数:", queryParams.toString());
        console.log("代理搜索书籍请求成功:", response.data);

        // 将响应发送回客户端
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("代理搜索书籍请求失败:", error);

        // 处理不同类型的错误
        if (axios.isAxiosError(error) && error.response) {
            return res.status(error.response.status).json({
                code: error.response.status.toString(),
                msg: "代理请求失败",
                data: null,
            });
        }

        // 默认错误响应
        return res.status(500).json({
            code: "500",
            msg: "内部服务器错误",
            data: null,
        });
    }
}
