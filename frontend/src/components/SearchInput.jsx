import { Send, Activity } from "lucide-react";

function SearchInput({ query, setQuery, handleAsk, isLoading }) {
  return (
    <div className="w-full max-w-2xl mx-auto relative group z-10 font-body">
      <div className="relative bg-[var(--color-surface-highest)]/80 backdrop-blur-xl rounded-full flex items-center p-2 shadow-[0_24px_48px_rgba(85,67,56,0.06)] border border-[var(--color-on-surface)]/15 transition-all">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Describe how you feel..."
          className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-lg text-[var(--color-on-surface)] placeholder-[var(--color-on-surface)]/40 w-full"
        />
        <button
          onClick={handleAsk}
          disabled={isLoading || !query.trim()}
          className="bg-[var(--color-primary)] hover:brightness-105 text-[var(--color-surface-lowest)] w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer flex-shrink-0 mr-1"
        >
          {isLoading ? (
            <Activity className="w-6 h-6 animate-spin" />
          ) : (
            <Send className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}

export default SearchInput;
