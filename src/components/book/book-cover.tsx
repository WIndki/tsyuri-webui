import { COVER_PLACEHOLDER } from "@/lib/api/cover";

import { CoverImage } from "./cover-image";
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
 * A Server Component, so the frame and the aspect ratio are part of the server-rendered HTML and the grid does not
 * reflow as covers arrive.
 *
 * Upstream returns two cover shapes (an index-hosted `/localPic/...` mirror and absolute third-party CDN URLs);
 * `resolveCoverUrl` has already made both absolute, and both hosts are declared in `images.remotePatterns`.
 *
 * Two upstream quirks are handled:
 *
 * - A missing image under `/localPic/` is answered with **HTTP 200 and a zero-byte body**, so no status check can detect
 *   it. `CoverImage` swaps in the placeholder when the browser fails to decode one.
 * - No width or height are published, so the aspect ratio comes from CSS (`aspect-ratio: 3/4`).
 */
export function BookCover({ src, alt, sizes, priority = false }: BookCoverProps) {
    return (
        <div className={styles.frame}>
            <CoverImage
                src={src === COVER_PLACEHOLDER ? COVER_PLACEHOLDER : src}
                alt={alt}
                sizes={sizes}
                eager={priority}
            />
        </div>
    );
}
