import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { CourseCard } from "./CourseCard";

const MotionDiv = motion.div;

export function CoursesModal({ open, courses, loading, onClose, onSelectCourse, checkoutInfo }) {
  return (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[1200] bg-black/55 p-4 sm:p-8"
        >
          <MotionDiv
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="glass-panel mx-auto h-full max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15"
          >
            <header className="flex items-center justify-between border-b border-white/15 px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/65">Premium Marketplace</p>
                <h3 className="text-xl font-semibold text-white sm:text-2xl">Startup Seeker Courses</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 p-2 text-white/85 transition hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="no-scrollbar h-[calc(92vh-88px)] overflow-y-auto px-5 py-5 sm:px-7">
              {checkoutInfo ? (
                <div className="mb-5 rounded-2xl border border-emerald-200/30 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                  <p className="font-semibold">Checkout initialized ({checkoutInfo.mode})</p>
                  <p>
                    Order: {checkoutInfo.orderId} | Amount: {checkoutInfo.amount} {checkoutInfo.currency}
                  </p>
                  <p className="text-xs text-emerald-100/85">Razorpay live mode activates automatically after key configuration.</p>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard
                    key={course.code}
                    course={course}
                    onSelect={onSelectCourse}
                    loading={loading}
                  />
                ))}
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
}
