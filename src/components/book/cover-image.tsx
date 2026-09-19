"use client";

import { useCallback, useState } from "react";

import Image from "next/image";

import { COVER_PLACEHOLDER } from "@/lib/api/cover";

import styles from "./book-cover.module.css";

interface CoverImageProps {
    src: string;
    alt: string;
    sizes: string;
    /** Set on the first row so the browser fetches those covers eagerly. */
    eager: boolean;
}

/**
 * The cover image itself.
 *
 * A Client Component for one reason: the fallback has to run when a cover fails to load, and that is only observable in
 * the browser. A missing file under the index's `/localPic/` mirror is answered with HTTP 200 and a zero-byte body, so
 * nothing server-side can tell that the image is unusable — the request succeeds, and only the decoder discovers there
 * is nothing to draw. Without this the card keeps an empty frame and the reader sees a blank box.
 */
export function CoverImage({ src, alt, sizes, eager }: CoverImageProps) {
    const [source, setSource] = useState(src);

    const onError = useCallback(() => {
        // Set once: a failure of the placeholder itself has no further fallback.
        setSource((current) => (current === COVER_PLACEHOLDER ? current : COVER_PLACEHOLDER));
    }, []);

    return (
        <Image
            src={source}
            alt={alt}
            fill
            sizes={sizes}
            // Covers are content images but not the largest paint element; the first row is fetched eagerly and the rest
            // lazily, which keeps the initial payload small.
            loading={eager ? "eager" : "lazy"}
            onError={onError}
            className={styles.image}
            unoptimized={source === COVER_PLACEHOLDER}
        />
    );
}
