"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ExploreFeaturesBrowserMockup from "./explore-features-browser-mockup";
import { FEATURE_ICON_MAP, FEATURES_DATA } from "./explore-features-data";

const AUTO_ADVANCE_MS = 5000;
const RESUME_AFTER_MS = 9000;

export default function ExploreFeaturesDashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sidebarRef = useRef<HTMLElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionVisibleRef = useRef(true);

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
    if (!isSectionVisibleRef.current) return;
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
    [goTo, pauseAndScheduleResume],
  );

  const handlePrev = useCallback(() => {
    goPrev();
    pauseAndScheduleResume();
  }, [goPrev, pauseAndScheduleResume]);

  const handleNext = useCallback(() => {
    goNext();
    pauseAndScheduleResume();
  }, [goNext, pauseAndScheduleResume]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearAutoInterval();
        clearResumeTimeout();
      } else if (isSectionVisibleRef.current) {
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

  // Pause carousel when the section is off-screen
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isSectionVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          startAutoAdvance();
        } else {
          clearAutoInterval();
          clearResumeTimeout();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [startAutoAdvance, clearAutoInterval, clearResumeTimeout]);

  // Scroll only within the sidebar nav — never scroll the page
  const scrollSidebarToActive = useCallback((index: number) => {
    const activeEl = sidebarItemRefs.current[index];
    const sidebar = sidebarRef.current;
    if (!activeEl || !sidebar) return;

    const sidebarTop = sidebar.scrollTop;
    const itemTop = activeEl.offsetTop;
    const itemBottom = itemTop + activeEl.offsetHeight;
    const visibleTop = sidebarTop;
    const visibleBottom = sidebarTop + sidebar.clientHeight;

    if (itemTop < visibleTop) {
      sidebar.scrollTo({ top: itemTop, behavior: "smooth" });
    } else if (itemBottom > visibleBottom) {
      sidebar.scrollTo({
        top: itemBottom - sidebar.clientHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollSidebarToActive(activeIndex);
  }, [activeIndex, scrollSidebarToActive]);

  return (
    <div ref={sectionRef} className="h-full w-full py-6 lg:py-10">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#252525] bg-[#101010]">
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
          <aside className="flex min-h-0 flex-col border-b border-[#252525] lg:border-b-0 lg:border-r">
            <div className="shrink-0 border-b border-[#252525] px-4 py-3 lg:py-4">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4 shrink-0 text-brand-purple" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Explore Features
                  </p>
                  <p className="text-xs text-text-muted">OpenSox Pro</p>
                </div>
              </div>
            </div>

            <nav
              ref={sidebarRef}
              className="flex max-h-[240px] flex-col overflow-y-auto [scrollbar-color:rgba(85,25,247,0.3)_transparent] [scrollbar-width:thin] lg:max-h-none lg:flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-purple/30 [&::-webkit-scrollbar-track]:bg-transparent"
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
                    className="group relative flex w-full items-center gap-3 border-b border-[#252525] px-4 py-3 text-left last:border-b-0"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute inset-0 border-l-2 border-brand-purple bg-brand-purple/10"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}

                    <motion.span
                      className="relative z-10 shrink-0"
                      animate={{
                        color: isActive ? "rgb(85 25 247)" : "rgb(209 209 209)",
                      }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      <Icon className="size-4" />
                    </motion.span>

                    <motion.span
                      className="relative z-10 truncate text-sm"
                      animate={{
                        color: isActive
                          ? "rgb(255 255 255)"
                          : "rgb(209 209 209)",
                        fontWeight: isActive ? 600 : 500,
                      }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      {feature.title}
                    </motion.span>

                    {!isActive && (
                      <span className="absolute inset-0 z-0 bg-transparent transition-colors duration-300 group-hover:bg-surface-hover" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="flex min-h-0 flex-1 flex-col p-5 lg:p-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`header-${activeIndex}`}
                  initial={{ opacity: 0.5, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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
                  <ChevronLeftIcon className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next feature"
                  className="flex size-9 items-center justify-center rounded-full border border-[#252525] text-text-tertiary transition-colors hover:border-brand-purple/50 hover:text-brand-purple"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`mockup-${activeIndex}`}
                initial={{ opacity: 0.5, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
