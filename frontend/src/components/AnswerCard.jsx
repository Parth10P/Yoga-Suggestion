import { Sparkles } from "lucide-react";
import SourcesList from "./SourcesList";
import ActionButtons from "./ActionButtons";

function AnswerCard({ answer, sources, poses, onFeedback }) {
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

        {poses && poses.length > 0 && (
          <div className="mt-8 border-t border-gray-100 dark:border-white/5 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-4 uppercase tracking-widest">
              Visual Reference
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {poses.map((pose, idx) => (
                <div key={idx} className="group flex flex-col items-center">
                  <div className="aspect-square w-full rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 overflow-hidden border border-indigo-100/50 dark:border-indigo-500/10 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-500/10 group-hover:-translate-y-1">
                    <img
                      src={pose.image}
                      alt={pose.name}
                      className="w-full h-full object-cover p-2 mix-blend-multiply dark:mix-blend-normal brightness-95 group-hover:brightness-100 transition-all"
                      onError={(e) => {
                        e.target.src =
                          "https://pocketyoga.com/assets/images/full/MountainArmsSide.png";
                      }}
                    />
                  </div>
                  <span className="mt-2 text-[10px] sm:text-xs font-bold text-gray-900 dark:text-gray-100 text-center uppercase tracking-tight truncate w-full px-1">
                    {pose.name}
                  </span>
                  {pose.sanskrit && (
                    <span className="text-[9px] sm:text-[10px] italic text-gray-500 dark:text-gray-400 text-center truncate w-full px-1">
                      {pose.sanskrit}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <SourcesList sources={sources} />
        <ActionButtons onFeedback={onFeedback} />
      </div>
    </div>
  );
}

export default AnswerCard;
