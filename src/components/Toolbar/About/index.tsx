import React from "react";
import dynamic from "next/dynamic";
import { Skeleton, Typography } from "antd";
import { GithubFilled } from "@ant-design/icons";

const { Paragraph, Link, Text } = Typography;

const About: React.FC = () => {
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

export default dynamic(() => Promise.resolve(About), {
    ssr: true,
    loading: () => <Skeleton />,
});
