;
import React from "react";
import {
    Collapse,
    Radio,
    Checkbox,
    Space,
    Tooltip,
    Row,
    Col,
    Typography,
    Form,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface SelectFormUIProps {
    formItemStyle: React.CSSProperties;
    labelStyle: React.CSSProperties;
}

/**
 * SelectFormUI 组件 - 专门负责选择表单的UI渲染
 * @param props SelectFormUIProps
 * @returns JSX.Element
 */
const SelectFormUI: React.FC<SelectFormUIProps> = ({ formItemStyle, labelStyle }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("SelectFormUI render");
    }

    const collapseItems = [
        {
            key: "0",
            label: (
                <Text strong style={{ fontSize: 16 }}>
                    高级选项
                </Text>
            ),
            children: (
                <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="small"
                >
                    <Row style={formItemStyle} align="middle">
                        <Col span={4} style={labelStyle}>
                            <Text>标签</Text>
                        </Col>
                        <Col span={20}>
                            <Form.Item
                                name="tags"
                                noStyle
                                initialValue={["变百", "百合"]}
                            >
                                <Checkbox.Group options={["变百", "百合"]} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row style={formItemStyle} align="middle">
                        <Col span={4} style={labelStyle}>
                            <Text>排序</Text>
                        </Col>
                        <Col span={20}>
                            <Form.Item
                                name="sort"
                                noStyle
                                initialValue="last_index_update_time"
                            >
                                <Radio.Group
                                    optionType="button"
                                    buttonStyle="solid"
                                    size="small"
                                >
                                    <Radio.Button value="last_index_update_time">
                                        更新
                                    </Radio.Button>
                                    <Radio.Button value="word_count">
                                        字数
                                    </Radio.Button>
                                    <Radio.Button value="click_purity_score">
                                        综合
                                    </Radio.Button>
                                    <Radio.Button value="create_time">
                                        入库时间
                                    </Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row style={formItemStyle} align="middle">
                        <Col span={4} style={labelStyle}>
                            <Text>字数高于</Text>
                        </Col>
                        <Col span={20}>
                            <Form.Item
                                name="wordCountMin"
                                noStyle
                                initialValue=""
                            >
                                <Radio.Group>
                                    <Space wrap>
                                        <Radio value="">不限</Radio>
                                        <Radio value="50000">5万+</Radio>
                                        <Radio value="150000">15万+</Radio>
                                        <Radio value="300000">30万+</Radio>
                                        <Radio value="500000">50万+</Radio>
                                        <Radio value="1000000">100万+</Radio>
                                        <Radio value="2000000">200万+</Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row style={formItemStyle} align="middle">
                        <Col span={4} style={labelStyle}>
                            <Text>字数低于</Text>
                        </Col>
                        <Col span={20}>
                            <Form.Item
                                name="wordCountMax"
                                noStyle
                                initialValue=""
                            >
                                <Radio.Group>
                                    <Space wrap>
                                        <Radio value="">不限</Radio>
                                        <Radio value="50000">5万-</Radio>
                                        <Radio value="150000">15万-</Radio>
                                        <Radio value="300000">30万-</Radio>
                                        <Radio value="500000">50万-</Radio>
                                        <Radio value="1000000">100万-</Radio>
                                        <Radio value="2000000">200万-</Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row style={formItemStyle} align="middle">
                        <Col span={4} style={labelStyle}>
                            <Text>纯度</Text>
                            <Tooltip title="纯度等级说明">
                                <QuestionCircleOutlined
                                    style={{ marginLeft: 4 }}
                                />
                            </Tooltip>
                        </Col>
                        <Col span={20}>
                            <Form.Item name="purity" noStyle initialValue="">
                                <Radio.Group optionType="button" size="small">
                                    <Radio.Button value="">不限</Radio.Button>
                                    <Radio.Button value="1">A+</Radio.Button>
                                    <Radio.Button value="2">A</Radio.Button>
                                    <Radio.Button value="3">A-</Radio.Button>
                                    <Radio.Button value="5">B</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row style={formItemStyle} align="middle">
                        <Col span={4} style={labelStyle}>
                            <Text>更新</Text>
                        </Col>
                        <Col span={20}>
                            <Form.Item
                                name="updatePeriod"
                                noStyle
                                initialValue=""
                            >
                                <Radio.Group optionType="button" size="small">
                                    <Radio.Button value="">不限</Radio.Button>
                                    <Radio.Button value="3">
                                        三日内
                                    </Radio.Button>
                                    <Radio.Button value="7">
                                        七日内
                                    </Radio.Button>
                                    <Radio.Button value="30">
                                        本月内
                                    </Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row style={formItemStyle} align="middle">
                        <Col span={4} style={labelStyle}>
                            <Text>状态</Text>
                        </Col>
                        <Col span={20}>
                            <Form.Item
                                name="bookStatus"
                                noStyle
                                initialValue=""
                            >
                                <Radio.Group optionType="button" size="small">
                                    <Radio.Button value="">不限</Radio.Button>
                                    <Radio.Button value="0">
                                        连载中
                                    </Radio.Button>
                                    <Radio.Button value="1">
                                        已完结
                                    </Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row style={formItemStyle} align="middle">
                        <Col span={4} style={labelStyle}>
                            <Text>平台</Text>
                        </Col>
                        <Col span={20}>
                            <Form.Item
                                name="sources"
                                noStyle
                                initialValue={[
                                    "SF轻小说",
                                    "次元姬",
                                    "刺猬猫",
                                    "起点",
                                ]}
                            >
                                <Checkbox.Group>
                                    <Space>
                                        {[
                                            "SF轻小说",
                                            "次元姬",
                                            "刺猬猫",
                                            "起点",
                                        ].map((source) => (
                                            <Checkbox
                                                key={source}
                                                value={source}
                                            >
                                                {source}
                                            </Checkbox>
                                        ))}
                                    </Space>
                                </Checkbox.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Collapse
                expandIconPosition="end"
                style={{
                    borderRadius: "4px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
                items={collapseItems}
            />
        </>
    );
};

export default React.memo(SelectFormUI);
