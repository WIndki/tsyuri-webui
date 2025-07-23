;
import React from "react";
import dynamic from "next/dynamic";
import { Skeleton, Typography } from "antd";
import { GithubFilled } from "@ant-design/icons";

const { Paragraph, Link, Text } = Typography;

/**
 * AboutUI 组件 - 专门负责关于信息的UI渲染
 * @returns JSX.Element
 */
const AboutUI: React.FC = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("AboutUI render");
    }

    return (
        <Paragraph>
            <Paragraph>
                感谢
                <Link href="https://index.tsyuri.com/" target="_blank">
                    tsyuri小说索引
                </Link>
                提供的后端数据
            </Paragraph>
            <Paragraph>
                感谢
                <Link
                    href="https://tieba.baidu.com/p/7552283328"
                    target="_blank"
                >
                    变身百合小说贴吧
                </Link>
                提供的小说数据
            </Paragraph>
            <Paragraph>
                <Text strong>该项目地址：</Text>
                <Link
                    href="https://github.com/WIndki/tsyuri-webui"
                    target="_blank"
                >
                    <GithubFilled size={10} />{" "}
                    https://github.com/WIndki/tsyuri-webui
                </Link>
            </Paragraph>
        </Paragraph>
    );
};

export default dynamic(() => Promise.resolve(AboutUI), {
    ssr: true,
    loading: () => <Skeleton />,
});
