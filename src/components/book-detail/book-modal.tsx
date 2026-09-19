"use client";

import { useCallback, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { Modal } from "antd";

import styles from "./book-modal.module.css";

interface BookModalProps {
    /**
     * The dialog's title.
     *
     * Empty is a supported value: the layout that renders the dialog does not know the record's name yet, because the
     * page below it is still resolving. The record's own heading names the dialog in that case, and `aria-label`
     * keeps it named while the placeholder is showing.
     */
    title: string;
    children: ReactNode;
}

/**
 * The dialog shell a book opens into when it is clicked from the list.
 *
 * A Client Component, because closing it is a navigation: `router.back()` returns to the results *and* to the
 * scroll position the visitor left, which is what makes the record feel like something opened over the list rather
 * than somewhere they went. It is also what makes the browser's back button close the dialog.
 *
 * The content arrives as `children` from the intercepting route, which is a Server Component that already resolved
 * the record. So the dialog opens with its content present, and the page behind it was never unmounted.
 *
 * ## Why the dialog is not full screen
 *
 * The list stays visible around it on purpose. A reader comparing two books, or unsure which result they clicked,
 * can see where they are; the record is a detail view of the list, not a separate place. On a phone there is no room
 * to show both, so there the dialog takes the viewport.
 */
export function BookModal({ title, children }: BookModalProps) {
    const router = useRouter();

    const close = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <Modal
            open
            onCancel={close}
            // Suppressed when empty, so the record's own heading is the only title rather than a duplicate.
            title={title || undefined}
            aria-label={title || "书籍详情"}
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
            classNames={{ body: styles.body }}
            destroyOnHidden
        >
            {children}
        </Modal>
    );
}
