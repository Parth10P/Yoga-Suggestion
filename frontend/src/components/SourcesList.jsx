import { BookOpen, ChevronRight } from "lucide-react";

function SourcesList({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <BookOpen className="w-4 h-4" />
        Sources
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <span
            key={source.id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-default"
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
