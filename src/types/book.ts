/**
 * Book 接口定义了书籍的数据结构
 * @interface Book
 * @property {string} id - 书籍唯一标识ID
 * @property {string | null} workDirection - 作品方向
 * @property {string} catId - 分类ID
 * @property {string | null} catName - 分类名称
 * @property {string} picUrl - 封面图片URL
 * @property {string | null} picUrlLocal - 本地封面图片路径
 * @property {string} bookName - 书籍名称
 * @property {string | null} authorId - 作者ID
 * @property {string} authorName - 作者名称
 * @property {string} bookDesc - 书籍描述
 * @property {number | null} score - 评分
 * @property {string} purity - 纯度分类
 * @property {string} bookStatus - 书籍状态(0:连载中, 1:已完结)
 * @property {number | null} visitCount - 访问次数
 * @property {string} wordCount - 字数
 * @property {number | null} commentCount - 评论数量
 * @property {number | null} yesterdayBuy - 昨日购买数
 * @property {string | null} lastIndexId - 最新章节ID
 * @property {string | null} lastIndexName - 最新章节名称
 * @property {string} lastIndexUpdateTime - 最后更新时间
 * @property {boolean | null} isVip - 是否为VIP书籍
 * @property {string | null} status - 状态
 * @property {string | null} updateTime - 更新时间
 * @property {string | null} createTime - 创建时间
 * @property {string | null} crawlSourceId - 爬取来源ID
 * @property {string} crawlSourceName - 爬取来源名称
 * @property {string | null} crawlBookId - 爬取的书籍ID
 * @property {string | null} crawlLastTime - 最后爬取时间
 * @property {boolean | null} crawlIsStop - 是否停止爬取
 * @property {string} tag - 标签
 * @property {string} userTag - 用户标签
 * @property {string} newTag - 新标签
 */
export interface Book {
    id: string;
    workDirection: string | null;
    catId: string;
    catName: string | null;
    picUrl: string;
    picUrlLocal: string | null;
    bookName: string;
    authorId: string | null;
    authorName: string;
    bookDesc: string;
    score: number | null;
    purity: string;
    bookStatus: string;
    visitCount: number | null;
    wordCount: string;
    commentCount: number | null;
    yesterdayBuy: number | null;
    lastIndexId: string | null;
    lastIndexName: string | null;
    lastIndexUpdateTime: string;
    isVip: boolean | null;
    status: string | null;
    updateTime: string | null;
    createTime: string | null;
    crawlSourceId: string | null;
    crawlSourceName: string;
    crawlBookId: string | null;
    crawlLastTime: string | null;
    crawlIsStop: boolean | null;
    tag: string;
    userTag: string;
    newTag: string;
}
