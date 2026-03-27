import { Sparkle } from "lucide-react";
import SourcesList from "./SourcesList";
import ActionButtons from "./ActionButtons";

function AnswerCard({ answer, sources, poses, onFeedback }) {
  return (
    <div className="bg-[var(--color-surface-lowest)] rounded-[2rem] p-8 md:p-10 shadow-[0_4px_24px_rgba(85,67,56,0.02)] relative overflow-hidden font-body mb-4">

      <div className="relative">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-[var(--color-on-surface)] whitespace-pre-line">
            {answer}
          </p>
        </div>

        {poses && poses.length > 0 && (
          <div className="mt-10 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {poses.map((pose, idx) => (
                <div key={idx} className="group flex flex-col">
                  <div className="aspect-[4/5] w-full rounded-[2rem] bg-[var(--color-surface-container)] overflow-hidden transition-all duration-300 group-hover:shadow-[0_12px_32px_rgba(85,67,56,0.08)] group-hover:-translate-y-1 mb-4">
                    <img
                      src={pose.image}
                      alt={pose.name}
                      className="w-full h-full object-cover mix-blend-multiply brightness-95 group-hover:brightness-100 transition-all"
                      onError={(e) => {
                        e.target.src =
                          "https://pocketyoga.com/assets/images/full/MountainArmsSide.png";
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-[var(--color-on-surface)] uppercase tracking-wide truncate w-full px-1">
                    {pose.name}
                  </span>
                  {pose.sanskrit && (
                    <span className="text-xs text-[var(--color-on-surface)]/60 truncate w-full px-1 mt-0.5">
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
