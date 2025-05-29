/**
 * 格式化小说字数
 * @param {string} wordCount -字数字符
 * @returns {string}  - 格式化后的字数字符串
 * 如果字数大于等于10000，则以万字为单位显示
 */
export const formatWordCount = (wordCount: string) => {
    const count = parseInt(wordCount);
    if (count >= 10000) {
        return `${(count / 10000).toFixed(1)}万字`;
    }
    return `${count}字`;
};

/**
 * 格式化小说更新时间
 * @param {string} time - 更新时间字符串
 * @description - 将时间字符串转换为相对于当前时间的描述
 * @returns {string} - 格式化后的时间描述
 * 如果是今天，则返回“今天”
 */
export const formatUpdateTime = (time: string) => {
    const updateDate = new Date(time);
    const now = new Date();
    const diffDays = Math.floor(
        (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
        return "今天";
    } else if (diffDays === 1) {
        return "昨天";
    } else if (diffDays < 30) {
        return `${diffDays}天前`;
    } else {
        return updateDate.toLocaleDateString();
    }
};
