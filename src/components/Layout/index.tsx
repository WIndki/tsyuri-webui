import React from "react";
import ThemeConfigProvider from "@/theme/antdConfigProvider";
import { Layout as AntdLayout } from "antd";

const Layout = ({ children }: { children: React.ReactNode }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("Layout render");
    }
    return (
        <ThemeConfigProvider>
            <AntdLayout style={{ minHeight: "100vh", width: "100%" }}>
                {children}
            </AntdLayout>
        </ThemeConfigProvider>
    );
};

export default React.memo(Layout);
