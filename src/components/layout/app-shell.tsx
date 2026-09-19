import { Suspense, type ReactNode } from "react";

import { PageToolbar } from "@/components/layout/page-toolbar";
import { SearchFailureModal } from "@/components/layout/search-failure-modal";

import styles from "./app-shell.module.css";

/**
 * The static outer frame of every page.
 *
 * A Server Component: no state, no browser APIs, so it renders once on the server and never
 * hydrates.
 *
 * ## Why this is a plain `<div>` and not `antd`'s `<Layout>`
 *
 * `Layout` is a *compound* component — the sub-parts are attached to the exported object at
 * runtime (`Layout.Content = Content`). antd marks its modules `"use client"`, so from a
 * Server Component Next.js sees `Layout` as a **client reference**: a stub carrying only the
 * framework's own markers (`$$typeof`, `$$id`, `$$async`). Custom statics are not copied onto
 * that stub, so `Layout.Content` is `undefined` on the server and rendering it throws
 * "Element type is invalid".
 *
 * The sub-parts are not re-exported from `antd` either (`es/index.js` exports only the default
 * `Layout`), so a Server Component cannot reach `Content` at all. Verified against the antd v6
 * source and reproduced in a build.
 *
 * The workaround is not to fight it: the outer frame is a centred column, which is four lines
 * of CSS and ships no JavaScript. `Layout`/`Layout.Content` remain available inside Client
 * Components, where the real implementation is loaded rather than a reference.
 */
export function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className={styles.shell}>
            <main className={styles.content}>{children}</main>
            {/*
             * `PageToolbar` calls `useSearchParams` to read the current display mode. Next.js treats
             * that as a request to opt out of static prerendering, so without a boundary above it
             * every page that the toolbar appears on — including the generated `/_not-found` — fails
             * to export. The fallback is empty because the controls are supplementary: the page is
             * complete and usable without them, so nothing should be reserved for them.
             */}
            <Suspense fallback={null}>
                <PageToolbar />
            </Suspense>

            {/*
             * Mounted once so every failed read is reported the same way, wherever it happened: the
             * initial render, a client navigation, or an appended page from the Server Action. It
             * renders nothing until a failure is reported.
             */}
            <SearchFailureModal />
        </div>
    );
}
