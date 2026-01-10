import { Send, Activity } from "lucide-react";

function SearchInput({ query, setQuery, handleAsk, isLoading }) {
  return (
    <div className="w-full max-w-2xl relative group z-10">
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur-lg"></div>
      <div className="relative bg-white dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-xl flex items-center p-2 border border-white/20 dark:border-white/10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          placeholder="Ask anything about yoga..."
          className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 w-full"
        />
        <button
          onClick={handleAsk}
          disabled={isLoading || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg shadow-indigo-600/20 active:scale-95 cursor-pointer"
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
