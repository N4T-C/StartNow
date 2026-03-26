import { Clock3, Sparkles } from "lucide-react";

export function CourseCard({ course, onSelect, loading }) {
  return (
    <article className="rounded-2xl border border-white/15 bg-black/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-white/70">{course.level}</p>
        <p className="rounded-full border border-emerald-300/40 bg-emerald-200/15 px-2 py-0.5 text-xs font-semibold text-emerald-100">
          Premium
        </p>
      </div>

      <h4 className="mb-1 text-lg font-semibold text-white">{course.title}</h4>
      <p className="mb-3 text-sm text-white/75">{course.subtitle}</p>

      <div className="mb-3 flex items-center gap-4 text-xs text-white/70">
        <span className="inline-flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" />
          {course.duration}
        </span>
        <span className="inline-flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          INR {course.priceInr}
        </span>
      </div>

      <ul className="mb-4 list-disc space-y-1 pl-4 text-xs text-white/70">
        {course.highlights?.slice(0, 3).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <button
        type="button"
        disabled={loading}
        onClick={() => onSelect(course)}
        className="w-full rounded-xl bg-gradient-to-r from-emerald-300 via-yellow-200 to-amber-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-105 disabled:opacity-70"
      >
        {loading ? "Processing..." : "Proceed To Premium Access"}
      </button>
    </article>
  );
}
