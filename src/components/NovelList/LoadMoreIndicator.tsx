import React from "react";
import { Spin } from "antd";
import styles from "./styles.module.css";

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
