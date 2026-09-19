"use client";

import { create } from "zustand";

/**
 * The interface state the URL cannot carry.
 *
 * ## What belongs here
 *
 * The search query lives in the URL and nowhere else. This store holds the three things that are genuinely
 * not addressable:
 *
 * 1. **A pending read.** The request a visitor just made has no representation in the URL until its response
 *    arrives, and the results area needs to know one is coming.
 * 2. **Proposed values.** A facet the visitor has chosen but the server has not confirmed, so the control can
 *    show it immediately instead of after the round-trip.
 * 3. **The last failure**, read by the modal and written by whichever read failed.
 *
 * ## Why a store rather than component state
 *
 * These are read and written by components that share no parent: the results island, the facet panel, the
 * keyword field, the pager, and the failure modal. Component state cannot reach across them.
 *
 * ## Why the pending state does not come from `useTransition`
 *
 * Measured in the browser: the flag clears about 40 ms after the click, when the router commits the new URL,
 * while the payload that URL describes takes roughly a second. A skeleton keyed to it appears and vanishes
 * before any data arrives.
 *
 * ## How the wait ends
 *
 * The results island, which is the component the server payload arrives at, reports completion. The delay
 * before the skeleton is shown is what makes the report meaningful: a payload that renders before the delay
 * cannot have been produced by the request, because the request had not been issued long enough ago. So the
 * store treats the wait as still outstanding until it has become visible, and clears on the next report
 * after that. See `endWait`.
 */

/** How long a read must last before a skeleton is worth showing. */
const SKELETON_DELAY_MS = 120;

/**
 * The action that repeats the most recent failed read.
 *
 * Held in a mutable box rather than in store state, because the component that owns the read replaces it on
 * every render with a version closing over the current query and page. Storing it in state would publish a
 * snapshot per render; passing it as a callback would require the owner to name itself inside its own
 * closure, which the hook rules reject.
 *
 * The modal invokes it from the click that confirms the retry, so the repeat happens in an event handler.
 */
const retryAction: { current: (() => void) | null } = { current: null };

export function setRetryAction(action: (() => void) | null): void {
    retryAction.current = action;
}

interface LastFailure {
    /** Visitor-facing description, already translated from the error kind. */
    message: string;
    /** Whether repeating the identical request could plausibly succeed. */
    retryable: boolean;
}

interface UiState {
    /** True from the moment a read is requested until its payload has rendered. */
    isWaiting: boolean;
    /** True once the wait has exceeded the skeleton delay. */
    showSkeleton: boolean;
    /** Placeholder count for the skeleton. Zero means the last known page size is used. */
    expectedCount: number;
    /**
     * Whether a payload has rendered since the read was requested.
     *
     * The payload almost always arrives before the skeleton delay elapses, because the router re-renders the
     * results area as soon as it commits the new URL. Recording that lets the delay decide whether a skeleton
     * is warranted at all: if the payload is already in, there is nothing left to wait for.
     */
    payloadArrived: boolean;

    /** Facet values the visitor has chosen but the server has not confirmed. */
    proposed: Record<string, string | undefined>;
    /**
     * The ordering the visitor has chosen, before the server confirms it.
     *
     * The heading above the results names the ordering, and it sits where the sort control cannot reach: the heading
     * is server-rendered from the committed query, while the control is a client island lower down. Without this they
     * disagree for the length of the read, which is exactly when the visitor is looking at them.
     */
    proposedSort: string | null;

    /** The most recent failed read, or `null`. */
    failure: LastFailure | null;

    beginWait: (expectedCount: number) => void;
    endWait: () => void;
    propose: (values: Record<string, string | undefined>) => void;
    clearProposed: () => void;
    proposeSort: (sort: string | null) => void;
    report: (failure: LastFailure) => void;
    dismissFailure: () => void;
    /** Runs the action registered through `setRetryAction`. */
    requestRetry: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
    isWaiting: false,
    showSkeleton: false,
    expectedCount: 0,
    payloadArrived: false,
    proposed: {},
    proposedSort: null,
    failure: null,

    beginWait: (expectedCount) => {
        set({ isWaiting: true, showSkeleton: false, expectedCount, payloadArrived: false });

        /*
         * The skeleton appears only if the read is still outstanding when the delay elapses.
         *
         * Page one of a common query is answered in tens of milliseconds, and a placeholder that flashes for
         * 30 ms reads as a fault rather than as progress. `payloadArrived` is what makes that distinction:
         * the results area reports every render it performs, including the one the router produces from the
         * old payload a few milliseconds after the click.
         */
        setTimeout(() => {
            const state = get();
            if (!state.isWaiting) return;

            if (state.payloadArrived) {
                // Nothing left to wait for, and the skeleton was never shown, so no flicker.
                set({ isWaiting: false, showSkeleton: false, payloadArrived: false });
                return;
            }

            set({ showSkeleton: true });
        }, SKELETON_DELAY_MS);
    },

    /**
     * Reports that the results area has rendered.
     *
     * Only ends the wait once it is visible, because a render that happens while the skeleton is still hidden is
     * either the router's re-render from the old payload or a response fast enough that no placeholder was
     * warranted. In both cases `beginWait`'s delay decides, using the flag recorded here.
     */
    endWait: () => {
        const state = get();
        if (!state.isWaiting) return;

        if (!state.showSkeleton) {
            set({ payloadArrived: true });
            return;
        }

        set({ isWaiting: false, showSkeleton: false, payloadArrived: false });
    },

    propose: (values) => set((state) => ({ proposed: { ...state.proposed, ...values } })),

    clearProposed: () => {
        const state = get();
        if (Object.keys(state.proposed).length === 0 && state.proposedSort === null) return;
        set({ proposed: {}, proposedSort: null });
    },

    proposeSort: (sort) => set({ proposedSort: sort }),

    report: (failure) => set({ failure }),

    dismissFailure: () => set({ failure: null }),

    requestRetry: () => {
        const action = retryAction.current;
        set({ failure: null });
        action?.();
    },
}));
