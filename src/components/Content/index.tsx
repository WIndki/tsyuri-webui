"use client";
import React from "react";
import { Layout } from "antd";

const Content = ({ children }: { children: React.ReactNode }) => {
    return (
        <Layout.Content
            style={{
                // maxWidth: "50rem",
                width: "100%",
                padding: "24px",
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
