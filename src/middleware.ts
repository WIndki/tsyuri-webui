import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_BASE_URL = "https://index.tsyuri.com";

export async function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    if (pathname.startsWith("/localPic")) {
        // 构建目标 URL
        const destinationHostname = "index.tsyuri.com";
        // 由于 matcher 的原因，pathname 已经以 /localPic 开头，
        // 并且端口号问题出在 host 上，而不是 path 上。
        const newPathname = pathname;

        const targetUrl = new URL(request.nextUrl.toString());
        targetUrl.protocol = "https";
        targetUrl.host = destinationHostname;
        targetUrl.port = ""; // 显式清除端口，使其使用协议的默认端口 (https -> 443)
        targetUrl.pathname = newPathname;
        // search (查询参数) 会自动保留在 targetUrl 中，因为它是从 request.nextUrl 克隆的

        // 重写请求到目标 URL
        const response = NextResponse.rewrite(targetUrl);

        return response;
    } else if (pathname === "/api/book/searchByPage") {
        // 只允许GET请求
        if (request.method !== "GET") {
            return NextResponse.json(
                { code: "405", msg: "Method Not Allowed", data: null },
                { status: 405 }
            );
        }

        const queryParamsString = searchParams.toString();
        const targetApiUrl = `${EXTERNAL_API_BASE_URL}/book/searchByPage?${queryParamsString}`;
        const encodedReferer = `${EXTERNAL_API_BASE_URL}/?${queryParamsString}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

        try {
            console.log({ queryParams: queryParamsString }, "中间件请求参数");
            const apiResponse = await fetch(targetApiUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json, text/javascript, */*; q=0.01",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language":
                        "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                    "Cache-Control": "no-cache",
                    Pragma: "no-cache",
                    "User-Agent":
                        request.headers.get("User-Agent") || // 优先使用客户端的User-Agent
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0",
                    DNT: "1", // Do Not Track
                    Priority: "u=1, i",
                    Referer: encodedReferer,
                    // 注意: 'Cookie' 头需要特殊处理，如果需要从客户端转发到目标服务器
                    // fetch 的 `credentials: 'include'` 会处理 Cookie，但需要目标服务器的 CORS 配置支持
                },
                signal: controller.signal,
                credentials: "omit", // 或 'include' 如果需要转发凭据/Cookie
                // 原始 axios 配置中有 withCredentials: true，对应 'include'
                // 但 'include' 需要目标服务器正确配置 CORS (Access-Control-Allow-Credentials)
                // 为了简单起见，如果不需要 Cookie，可以使用 'omit' 或 'same-origin'
            });

            clearTimeout(timeoutId);

            const responseBody = await apiResponse.json();
            console.log("中间件代理搜索书籍请求成功");

            // 将从外部API获得的响应头复制到我们的响应中 (可选, 但对于缓存等行为可能有用)
            const responseHeaders = new Headers();
            apiResponse.headers.forEach((value, key) => {
                // 避免复制 Next.js 或 Vercel 自动处理的头，或可能引起问题的头
                if (
                    ![
                        "content-encoding",
                        "transfer-encoding",
                        "connection",
                    ].includes(key.toLowerCase())
                ) {
                    responseHeaders.set(key, value);
                }
            });
            // 确保 Content-Type 正确
            if (!responseHeaders.has("Content-Type")) {
                responseHeaders.set("Content-Type", "application/json");
            }

            if (!apiResponse.ok) {
                console.error(
                    {
                        status: apiResponse.status,
                        statusText: apiResponse.statusText,
                        body: responseBody,
                    },
                    `中间件代理请求失败`
                );
                return NextResponse.json(
                    responseBody || {
                        // 如果 responseBody 为空或无效 JSON，则使用默认错误
                        code: apiResponse.status.toString(),
                        msg: apiResponse.statusText || "代理请求失败",
                        data: null,
                    },
                    { status: apiResponse.status, headers: responseHeaders }
                );
            }

            return NextResponse.json(responseBody, {
                status: apiResponse.status,
                headers: responseHeaders,
            });
        } catch (error: unknown) {
            clearTimeout(timeoutId);
            console.error({ err: error }, "中间件代理搜索书籍请求异常");

            return NextResponse.json(
                { code: "500", msg: "内部服务器错误 (中间件)", data: null },
                { status: 500 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    // 匹配所有以 /localPic 开头的路径以及 /api/book/searchByPage 路径
    matcher: ["/localPic/:path*", "/api/book/searchByPage"],
};
