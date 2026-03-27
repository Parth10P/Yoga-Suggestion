import { ThumbsUp, ThumbsDown } from "lucide-react";

function ActionButtons({ onFeedback }) {
  return (
    <div className="mt-10 pt-6 flex items-center justify-between border-t border-[var(--color-on-surface)]/5">
      <span className="text-sm text-[var(--color-on-surface)]/50 font-medium">
        Was this helpful?
      </span>
      <div className="flex gap-2">
        <button
          onClick={() => onFeedback("up")}
          className="p-2 rounded-full hover:bg-[var(--color-secondary)]/10 text-[var(--color-on-surface)]/40 hover:text-[var(--color-secondary)] transition-colors cursor-pointer"
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => onFeedback("down")}
          className="p-2 rounded-full hover:bg-red-500/10 text-[var(--color-on-surface)]/40 hover:text-red-500 transition-colors cursor-pointer"
        >
          <ThumbsDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ActionButtons;
