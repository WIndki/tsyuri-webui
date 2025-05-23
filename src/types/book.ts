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
