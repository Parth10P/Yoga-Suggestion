import { Sparkles } from "lucide-react";
import SourcesList from "./SourcesList";
import ActionButtons from "./ActionButtons";

function AnswerCard({ answer, sources, onFeedback }) {
  return (
    <div className="bg-white dark:bg-zinc-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Suggestion
          </h2>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {answer}
          </p>
        </div>

        <SourcesList sources={sources} />
        <ActionButtons onFeedback={onFeedback} />
      </div>
    </div>
  );
}

export default AnswerCard;
