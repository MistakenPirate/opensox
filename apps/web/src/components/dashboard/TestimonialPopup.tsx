"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAnalytics } from "@/hooks/useAnalytics";

const DISMISS_KEY = "testimonialPopupDismissedAt";
const COOLDOWN_DAYS = 5;

function isCooldownActive(): boolean {
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (!dismissedAt) return false;

  const daysSinceDismissed =
    (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);

  return daysSinceDismissed < COOLDOWN_DAYS;
}

export const TestimonialPopup = (): JSX.Element | null => {
  const [dismissed, setDismissed] = useState(true);
  const router = useRouter();
  const { trackLinkClick, trackButtonClick } = useAnalytics();

  const { data, isLoading } = trpc.testimonial.shouldShowPopup.useQuery(undefined, {
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

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

  const handleDismiss = () => {
    trackButtonClick("Testimonial Popup Dismissed", "dashboard-home");
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  const handleSubmitClick = () => {
    trackLinkClick("/testimonials/submit", "Share feedback", "dashboard-home", false);
    router.push("/testimonials/submit");
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="testimonial-popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-dash-surface border border-dash-border rounded-xl p-6 shadow-xl w-full max-w-sm mx-4 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Text */}
            <div className="flex flex-col items-center text-center gap-2">
              <h2 className="text-text-primary text-base font-semibold">
                Enjoying Opensox Pro?
              </h2>
              <p className="text-text-muted text-sm leading-relaxed">
                {"We hope you've enjoyed using Opensox Pro! If you have a minute, would you mind sharing your experience? Your feedback means a lot to us and helps others find us."}
              </p>
            </div>
  
            {/* Buttons */}
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={handleSubmitClick}
                className="w-full px-4 py-2.5 rounded-lg bg-brand-purple text-text-primary text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Share feedback
              </button>
              <button
                onClick={handleDismiss}
                className="w-full px-4 py-2.5 rounded-lg text-text-muted text-sm hover:text-text-secondary hover:bg-dash-hover transition-colors"
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