import { BookOpen } from "lucide-react";

export function CoursesButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel absolute left-5 top-5 z-[1000] inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
    >
      <BookOpen className="h-3.5 w-3.5" />
      Courses
    </button>
  );
}
