import { BookOpen, ChevronRight } from "lucide-react";

function SourcesList({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-8 pt-6">
      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-[var(--color-on-surface)]/50 uppercase tracking-widest">
        <BookOpen className="w-4 h-4" />
        Sources
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <span
            key={source.id}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--color-surface-container)] text-sm text-[var(--color-on-surface)]/70 hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] transition-colors cursor-default"
          >
            {source.title}
            <ChevronRight className="w-3 h-3 opacity-50" />
          </span>
        ))}
      </div>
    </div>
  );
}

export default SourcesList;
