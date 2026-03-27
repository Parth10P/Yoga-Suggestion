import { Send, Activity } from "lucide-react";

function SearchInput({ query, setQuery, handleAsk, isLoading }) {
  return (
    <div className="w-full max-w-2xl mx-auto relative group z-10 font-body">
      <div className="relative bg-[#EBE4D8] rounded-full flex items-center p-1.5 shadow-[0_8px_32px_rgba(85,67,56,0.04)] border border-[#dbd0c0] transition-all">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Describe how you feel..."
          className="flex-1 bg-transparent border-none outline-none px-6 py-3.5 text-lg text-[var(--color-on-surface)] placeholder-[var(--color-on-surface)]/40 w-full"
        />
        <button
          onClick={handleAsk}
          disabled={isLoading || !query.trim()}
          className="bg-[#EBA87E] hover:bg-[#E39E72] text-white w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer flex-shrink-0 mr-1 shadow-sm"
        >
          {isLoading ? (
            <Activity className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default SearchInput;
