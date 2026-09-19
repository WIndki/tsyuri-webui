"use client";

import { useEffect } from "react";

import { App } from "antd";
import { WarningOutlined } from "@ant-design/icons";

import { useUiStore } from "@/lib/search/ui-store";

/**
 * Reports a failed read as a modal.
 *
 * Mounted once by the application shell, so every failure — the initial render failing, a client navigation
 * failing, an appended page failing — arrives in the same place with the same wording.
 *
 * `Modal` comes from `App.useModal` rather than the static `Modal.error`, because the static method renders
 * outside the `ConfigProvider` and therefore loses the theme and the locale.
 */
export function SearchFailureModal() {
    const { modal } = App.useApp();

    const failure = useUiStore((state) => state.failure);
    const dismissFailure = useUiStore((state) => state.dismissFailure);
    const requestRetry = useUiStore((state) => state.requestRetry);

    /*
     * The dialog is opened from an effect because `modal.error` subscribes to the dialog's own state, which
     * cannot be done while React is rendering this component.
     */
    useEffect(() => {
        if (!failure) return;

        const instance = modal.error({
            title: "加载失败",
            icon: <WarningOutlined />,
            content: failure.message,
            okText: failure.retryable ? "重试" : "知道了",
            centered: true,
            onOk: () => {
                if (failure.retryable) requestRetry();
                else dismissFailure();
            },
            afterClose: dismissFailure,
        });

        return () => instance.destroy();
    }, [failure, modal, dismissFailure, requestRetry]);

    return null;
}
