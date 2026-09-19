"use client";

import { useCallback, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { Modal } from "antd";

import styles from "./book-modal.module.css";

interface BookModalProps {
    children: ReactNode;
}

/**
 * The dialog a book opens into.
 *
 * A Client Component, because closing it is a navigation: `router.back()` returns to the results *and* to the scroll
 * position the visitor left, which is what makes the record feel like something opened over the list rather than
 * somewhere they went. It is also what makes the browser's back button close the dialog.
 *
 * The content arrives as `children` from the intercepting route, which is a Server Component that resolved the record.
 * The dialog opens before that resolves, with the placeholder inside it.
 *
 * ## Why the dialog is not full screen
 *
 * The list stays visible around it on purpose. A reader comparing two books, or unsure which result they clicked, can
 * see where they are; the record is a detail view of the list, not a separate place. On a phone there is no room to show
 * both, so there the dialog takes the viewport.
 */
export function BookModal({ children }: BookModalProps) {
    const router = useRouter();

    const close = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <Modal
            open
            onCancel={close}
            /*
             * An empty header, present for its space.
             *
             * The record names itself with its own heading, so a title here would say the same words twice. The header is
             * kept because the close button lives in it: without one, antd places the button at the dialog's top edge,
             * where it lands on the record's first row and on the scrollbar once the body scrolls.
             */
            title=" "
            aria-label="书籍详情"
            footer={null}
            centered
            width={760}
            // The record can be long, so the dialog scrolls as a whole rather than clipping the description.
            style={{ maxWidth: "calc(100vw - 32px)" }}
            styles={{
                body: {
                    maxHeight: "min(76vh, 780px)",
                    overflowY: "auto",
                    // Keeps a scroll inside the dialog from continuing into the list behind it.
                    overscrollBehavior: "contain",
                },
            }}
            classNames={{ header: styles.header, body: styles.body }}
            destroyOnHidden
        >
            {children}
        </Modal>
    );
}
