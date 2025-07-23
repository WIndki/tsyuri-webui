import { Spin } from "antd";
import React, { Suspense } from "react";
import Content from "@/components/Content";
import SearchForm from "@/components/SearchForm";
import NovelList from "@/components/NovelList";
import Toolbar from "@/components/Toolbar";
import RouteInitializer from "@/components/RouteInitializer";

interface MainUIProps {
    initial: boolean;
    processMainContent: () => boolean;
    isLoading: () => boolean;
}

/**
 * MainUI 组件 - 专门负责主页面的UI渲染
 * @param props MainUIProps
 * @returns JSX.Element
 */
const MainUI: React.FC<MainUIProps> = ({ 
    // initial,
    processMainContent,
    // isLoading
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("MainUI render");
    }
    
    // 处理主内容渲染
    const processedInitial = processMainContent();

    // 内部组件，使用路由同步
    const MainContent = () => {
        return (
            <>
                {/* 路由初始化组件，必须在 Suspense 内 */}
                <RouteInitializer />
                {processedInitial && (
                    <Content>
                        <NovelList />
                    </Content>
                )}
            </>
        );
    };

    return (
        <>
            <Suspense
                fallback={
                    <div style={{ margin: "0 auto" }}>
                        <Spin size="large" />
                    </div>
                }
            >
                <MainContent />
            </Suspense>
            <SearchForm />
            <Toolbar />
        </>
    );
};

MainUI.displayName = "MainUI";

export default React.memo(MainUI);
