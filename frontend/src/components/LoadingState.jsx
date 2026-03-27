import { Leaf } from "lucide-react";

function LoadingState() {
  return (
    <div className="mt-12 flex flex-col items-center justify-center animate-in fade-in duration-700">
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        <div className="absolute inset-0 bg-[var(--color-secondary)]/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-2 bg-[var(--color-secondary)]/40 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
        <div className="relative bg-[var(--color-surface-lowest)] text-[var(--color-secondary)] w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-10">
          <Leaf className="w-5 h-5 animate-pulse" />
        </div>
      </div>
      <p className="text-[var(--color-on-surface)]/60 font-medium tracking-wide font-body">
        Finding your flow...
      </p>
    </div>
  );
}

export default LoadingState;
