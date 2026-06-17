"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ExploreFeaturesBrowserMockup from "./explore-features-browser-mockup";
import {
  FEATURE_ICON_MAP,
  FEATURES_DATA,
} from "./explore-features-data";

const AUTO_ADVANCE_MS = 5000;
const RESUME_AFTER_MS = 9000;

export default function ExploreFeaturesDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileSidebarRef = useRef<HTMLDivElement>(null);

  const activeFeature = FEATURES_DATA[activeIndex];
  const ActiveIcon = FEATURE_ICON_MAP[activeFeature.icon];

  const clearAutoInterval = useCallback(() => {
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
  }, []);

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const goTo = useCallback((index: number) => {
    const wrapped =
      ((index % FEATURES_DATA.length) + FEATURES_DATA.length) %
      FEATURES_DATA.length;
    setActiveIndex(wrapped);
  }, []);

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  const startAutoAdvance = useCallback(() => {
    clearAutoInterval();
    autoIntervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURES_DATA.length);
    }, AUTO_ADVANCE_MS);
  }, [clearAutoInterval]);

  const pauseAndScheduleResume = useCallback(() => {
    clearAutoInterval();
    clearResumeTimeout();
    resumeTimeoutRef.current = setTimeout(() => {
      startAutoAdvance();
    }, RESUME_AFTER_MS);
  }, [clearAutoInterval, clearResumeTimeout, startAutoAdvance]);

  const handleManualSelect = useCallback(
    (index: number) => {
      goTo(index);
      pauseAndScheduleResume();
    },
    [goTo, pauseAndScheduleResume]
  );

  const handlePrev = useCallback(() => {
    goPrev();
    pauseAndScheduleResume();
  }, [goPrev, pauseAndScheduleResume]);

  const handleNext = useCallback(() => {
    goNext();
    pauseAndScheduleResume();
  }, [goNext, pauseAndScheduleResume]);

  // Start auto-advance on mount; pause when tab is hidden
  useEffect(() => {
    startAutoAdvance();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAutoInterval();
        clearResumeTimeout();
      } else {
        startAutoAdvance();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearAutoInterval();
      clearResumeTimeout();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startAutoAdvance, clearAutoInterval, clearResumeTimeout]);

  // Scroll active sidebar item into view on mobile
  useEffect(() => {
    const activeEl = sidebarItemRefs.current[activeIndex];
    if (activeEl && mobileSidebarRef.current) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  return (
    <div className="h-full w-full py-6 lg:py-10">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#252525] bg-[#101010]">
        {/* Card header */}
        <div className="flex flex-col gap-4 border-b border-[#252525] px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="max-w-xl text-sm text-[#d1d1d1] lg:text-base">
            Everything included in OpenSox Pro — mentorship, community, and
            career acceleration.
          </p>
          <Link
            href="/pricing"
            className="shrink-0 self-start rounded-full border border-brand-purple/50 px-5 py-2 text-sm font-medium text-brand-purple transition-colors hover:bg-brand-purple/10 sm:self-center"
          >
            Upgrade Now
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(240px,320px)_1fr]">
          {/* Left sidebar */}
          <aside className="flex flex-col border-b border-[#252525] lg:border-b-0 lg:border-r">
            {/* Sidebar mini header — desktop only */}
            <div className="hidden border-b border-[#252525] px-4 py-4 lg:block">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 shrink-0 text-brand-purple" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Explore Features
                  </p>
                  <p className="text-xs text-text-muted">OpenSox Pro</p>
                </div>
              </div>
            </div>

            {/* Mobile: horizontal scroll */}
            <div
              ref={mobileSidebarRef}
              className="flex gap-1 overflow-x-auto px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
            >
              {FEATURES_DATA.map((feature, index) => {
                const Icon = FEATURE_ICON_MAP[feature.icon];
                const isActive = index === activeIndex;
                return (
                  <button
                    key={feature.id}
                    ref={(el) => {
                      sidebarItemRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => handleManualSelect(index)}
                    className={cn(
                      "flex shrink-0 snap-center items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
                      isActive
                        ? "border-brand-purple/50 bg-brand-purple/10 text-brand-purple"
                        : "border-[#252525] text-text-tertiary hover:text-text-secondary"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="max-w-[140px] truncate text-xs font-medium">
                      {feature.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Desktop: vertical list */}
            <nav className="hidden flex-1 flex-col overflow-y-auto lg:flex lg:max-h-[560px] lg:[scrollbar-color:rgba(85,25,247,0.3)_transparent] lg:[scrollbar-width:thin] lg:[&::-webkit-scrollbar]:w-1.5 lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-thumb]:bg-brand-purple/30 lg:[&::-webkit-scrollbar-track]:bg-transparent">
              {FEATURES_DATA.map((feature, index) => {
                const Icon = FEATURE_ICON_MAP[feature.icon];
                const isActive = index === activeIndex;
                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => handleManualSelect(index)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-[#252525] px-4 py-3 text-left transition-colors last:border-b-0",
                      isActive
                        ? "border-l-2 border-l-brand-purple bg-brand-purple/10 text-brand-purple"
                        : "border-l-2 border-l-transparent text-text-tertiary hover:bg-surface-hover hover:text-text-secondary"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        isActive ? "text-brand-purple" : ""
                      )}
                    />
                    <span
                      className={cn(
                        "truncate text-sm font-medium",
                        isActive ? "text-text-primary" : ""
                      )}
                    >
                      {feature.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right content panel */}
          <div className="flex min-h-0 flex-1 flex-col p-5 lg:p-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`header-${activeIndex}`}
                  initial={{ opacity: 0.8, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0.8, y: -10 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="min-w-0 flex-1"
                >
                  <h3 className="text-xl font-semibold tracking-tight text-text-primary lg:text-2xl">
                    {activeFeature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#d1d1d1] lg:text-base">
                    {activeFeature.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous feature"
                  className="flex size-9 items-center justify-center rounded-full border border-[#252525] text-text-tertiary transition-colors hover:border-brand-purple/50 hover:text-brand-purple"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next feature"
                  className="flex size-9 items-center justify-center rounded-full border border-[#252525] text-text-tertiary transition-colors hover:border-brand-purple/50 hover:text-brand-purple"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`mockup-${activeIndex}`}
                initial={{ opacity: 0.8, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.8, y: -10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="min-h-0 flex-1"
              >
                <ExploreFeaturesBrowserMockup
                  imageSrc={activeFeature.image}
                  featureTitle={activeFeature.title}
                  FeatureIcon={ActiveIcon}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
