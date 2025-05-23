// 格式化字数显示
export const formatWordCount = (wordCount: string) => {
    const count = parseInt(wordCount);
    if (count >= 10000) {
        return `${(count / 10000).toFixed(1)}万字`;
    }
    return `${count}字`;
};

// 格式化更新时间
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
