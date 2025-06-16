"use client";
import { Spin } from "antd";
import dynamic from "next/dynamic";

const LazyLoadMain = dynamic(() => import("./index"), {
    loading: () => (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <Spin size="large" />
        </div>
    ),
    ssr: false,
});

export default LazyLoadMain;
