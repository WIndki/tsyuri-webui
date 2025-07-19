import React from "react";
import { Spin } from "antd";
import styles from "./styles.module.css";

/**
 * LoadMoreIndicatorProps 接口定义了加载更多指示器组件所需的属性
 * @interface LoadMoreIndicatorProps
 * @property {boolean} loading - 是否正在加载
 * @property {boolean} hasMore - 是否还有更多数据可加载
 * @property {boolean} hasBooks - 是否已经加载了书籍
 * @property {React.RefObject<HTMLDivElement>} loadMoreRef - 用于无限滚动的引用对象
 */
interface LoadMoreIndicatorProps {
    loading: boolean;
    hasMore: boolean;
    hasBooks: boolean;
    loadMoreRef: React.RefObject<HTMLDivElement>;
}

const LoadMoreIndicator: React.FC<LoadMoreIndicatorProps> = ({
    loading,
    hasMore,
    hasBooks,
    loadMoreRef,
}) => {
    return (
        <div ref={loadMoreRef} className={styles.loadMoreContainer}>
            {loading && <Spin />}
            {!hasMore && hasBooks && (
                <div className={styles.noMoreText}>没有更多了</div>
            )}
        </div>
    );
};

export default React.memo(LoadMoreIndicator);
