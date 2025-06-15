"use client";
import React from "react";
import { Layout } from "antd";

const Content = ({ children }: { children: React.ReactNode }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("Content render");
    }
    return (
        <Layout.Content
            style={{
                // maxWidth: "50rem",
                width: "100%",
                margin: "0 auto",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {children}
        </Layout.Content>
    );
};

export default Content;
