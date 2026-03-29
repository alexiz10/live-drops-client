import React from "react";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDrawerStore } from "../../lib/drawer-store";
import { formatTime } from "../../lib/utils";

interface MobileBiddingDrawerProps {
  displayPrice: string;
  displayTime: number;
  displayIsEnded: boolean;
  isLosing: boolean;
  displayHasParticipated: boolean;
  children: React.ReactNode;
  className?: string;
}

export function MobileBiddingDrawer({
  displayPrice,
  displayTime,
  displayIsEnded,
  isLosing,
  displayHasParticipated,
  children,
  className = "",
}: MobileBiddingDrawerProps) {
  const { isOpen, toggle, open } = useDrawerStore();
  const prevLosingRef = useRef(isLosing);

  // Auto-expand at 10 seconds remaining
  useEffect(() => {
    if (!isOpen && displayTime <= 10 && displayTime > 0 && !displayIsEnded) {
      open();
    }
  }, [displayTime, isOpen, displayIsEnded, open]);

  // Auto-expand when user gets outbid
  useEffect(() => {
    const wasNotLosing = !prevLosingRef.current;
    const isNowLosing = isLosing && displayHasParticipated && !displayIsEnded;

    if (wasNotLosing && isNowLosing && !isOpen) {
      // Add a small delay to avoid flashing when proxy bids kick in immediately
      const timer = setTimeout(() => {
        // Double-check user is still losing after delay (proxy might have won it back)
        if (isLosing && displayHasParticipated && !displayIsEnded && !isOpen) {
          open();
        }
      }, 500);

      return () => clearTimeout(timer);
    }

    prevLosingRef.current = isLosing;
  }, [isLosing, displayHasParticipated, isOpen, displayIsEnded, open]);

  return (
    <motion.div
      className={`fixed right-0 bottom-0 left-0 z-50 ${className}`}
      initial={false}
      animate={{ height: isOpen ? "auto" : "80px" }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
    >
      <div className="rounded-t-3xl border-t border-zinc-200 bg-white/95 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl">
        <button
          onClick={toggle}
          className="flex w-full cursor-pointer items-center justify-between p-5 transition-opacity hover:opacity-80 active:opacity-60"
          aria-label={isOpen ? "Collapse bidding terminal" : "Expand bidding terminal"}
          aria-expanded={isOpen}
        >
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              {displayIsEnded ? "Final Price" : "Current Bid"}
            </span>
            <motion.div
              key={displayPrice}
              initial={{ scale: 1.05, color: "#10b981" }}
              animate={{ scale: 1, color: "#09090b" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-2xl font-black tracking-tighter"
            >
              $
              {Number(displayPrice).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            {!displayIsEnded ? (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                  Time Left
                </span>
                <span
                  className={`text-lg font-bold ${displayTime <= 60 ? "animate-pulse text-red-500" : "text-zinc-900"}`}
                >
                  {formatTime(displayTime)}
                </span>
              </div>
            ) : null}

            <motion.svg
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-400"
            >
              <polyline points="18 15 12 9 6 15" />
            </motion.svg>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-[85vh] overflow-y-auto border-t border-zinc-200 px-5 pt-4 pb-5"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isOpen ? "Bidding terminal expanded" : "Bidding terminal collapsed"}
        </div>
      </div>
    </motion.div>
  );
}
