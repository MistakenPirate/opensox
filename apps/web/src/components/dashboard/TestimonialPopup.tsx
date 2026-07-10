"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAnalytics } from "@/hooks/useAnalytics";

const DISMISS_KEY = "testimonialPopupDismissedAt";
const COOLDOWN_DAYS = 5;
const STALE_TIME_MS = 15 * 60 * 1000; // 15 minutes
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isCooldownActive(): boolean {
  try {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (!dismissedAt) return false;

    const daysSinceDismissed =
      (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);

    return daysSinceDismissed < COOLDOWN_DAYS;
  } catch (error) {
    console.error("Error checking cooldown", error);
    return false;
  }
}

function setCooldown(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch (error) {
    console.error("Error dismissing testimonial popup", error);
  }
}

export const TestimonialPopup = (): JSX.Element => {
  const [dismissed, setDismissed] = useState(true);
  const router = useRouter();
  const { trackLinkClick, trackButtonClick } = useAnalytics();
  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const { data, isLoading } = trpc.testimonial.shouldShowPopup.useQuery(
    undefined,
    {
      staleTime: STALE_TIME_MS,
      refetchOnWindowFocus: false,
    }
  );

  const isOpen = !dismissed;

  // show popup once eligibility is confirmed and cooldown has passed
  useEffect(() => {
    if (!isLoading) {
      if (data?.show && !isCooldownActive()) {
        setDismissed(false);
      } else {
        setDismissed(true);
      }
    }
  }, [data, isLoading]);

  // lock body scroll, focus primary button, restore focus on close
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // defer focus until after paint so the dialog is in the DOM
    const focusTimer = window.setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen]);

  const handleDismiss = () => {
    trackButtonClick("Testimonial Popup Dismissed", "dashboard-home");
    setCooldown();
    setDismissed(true);
  };

  const handleSubmitClick = () => {
    trackLinkClick(
      "/testimonials/submit",
      "Share feedback",
      "dashboard-home",
      false
    );
    setCooldown();
    setDismissed(true);
    router.push("/testimonials/submit");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      handleDismiss();
      return;
    }

    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => el.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="testimonial-popup"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="testimonial-popup-title"
          aria-describedby="testimonial-popup-desc"
          tabIndex={-1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm outline-none"
          onClick={handleDismiss}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mx-4 flex w-full max-w-sm flex-col gap-5 rounded-xl border border-dash-border bg-dash-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h2
                id="testimonial-popup-title"
                className="text-lg font-semibold text-text-primary"
              >
                hi! sorry for this annoying pop-up.
              </h2>
              <p
                id="testimonial-popup-desc"
                className="text-md leading-relaxed text-text-tertiary"
              >
                {
                  "i manage everything on my own, so reviews from customers like you are the only marketing for Opensox. it helps me pay the rent and keep Opensox alive. i just wanna ask for 2 mins of your time to please leave a review on Opensox Pro. thanks!!"
                }
              </p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <button
                ref={primaryButtonRef}
                type="button"
                onClick={handleSubmitClick}
                className="w-full rounded-lg bg-brand-purple px-4 py-2.5 text-sm font-medium text-text-primary transition-opacity hover:opacity-90"
              >
                Share feedback
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full rounded-lg px-4 py-2.5 text-sm text-text-muted transition-colors hover:bg-dash-hover hover:text-text-secondary"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
