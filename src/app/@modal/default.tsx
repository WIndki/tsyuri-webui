/**
 * What the modal slot renders when no navigation has been intercepted.
 *
 * Every parallel slot needs a default, because Next.js cannot know what the slot held for a URL it has not
 * rendered before. Returning `null` means an ordinary page load carries the slot and shows nothing for it.
 */
export default function ModalSlotDefault() {
    return null;
}
