import Image from "next/image";

import { COVER_PLACEHOLDER } from "@/lib/api/cover";

import styles from "./book-cover.module.css";

interface BookCoverProps {
    src: string;
    alt: string;
    /** Rendered size hint. The grid uses a 3:4 cover, so `sizes` should match the column. */
    sizes: string;
    priority?: boolean;
}

/**
 * A fixed-ratio cover image.
 *
 * A Server Component: `next/image` resolves and optimises on the server, and the placeholder
 * fallback is decided here rather than in the browser.
 *
 * Upstream returns two cover shapes (an index-hosted `/localPic/...` mirror and absolute
 * third-party CDN URLs); `resolveCoverUrl` has already made both absolute, and both hosts are
 * declared in `images.remotePatterns`.
 *
 * Two upstream quirks are handled by construction:
 *
 * - A missing image under `/localPic/` is answered with **HTTP 200 and a zero-byte body**, so
 *   a status check cannot detect it. The CSS background behind the image shows through, and
 *   `onError` on the client swaps in the placeholder.
 * - No width/height are published, so the aspect ratio comes from CSS (`aspect-ratio: 3/4`)
 *   rather than from the payload, which is what keeps the grid from reflowing as covers load.
 */
export function BookCover({ src, alt, sizes, priority = false }: BookCoverProps) {
    const isPlaceholder = src === COVER_PLACEHOLDER;

    return (
        <div className={styles.frame}>
            <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                priority={priority}
                // Covers are content images but not the LCP element; loading the first row
                // eagerly and the rest lazily keeps the initial payload small.
                loading={priority ? "eager" : "lazy"}
                className={styles.image}
                // Third-party hosts occasionally 404 individual covers; the placeholder is
                // the correct fallback rather than a broken-image icon.
                unoptimized={isPlaceholder}
            />
        </div>
    );
}
