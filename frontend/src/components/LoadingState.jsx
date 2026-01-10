import { Sparkles } from "lucide-react";

function LoadingState() {
  return (
    <div className="mt-16 flex flex-col items-center animate-pulse">
      <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 relative">
        <Sparkles
          className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin"
          style={{ animationDuration: "3s" }}
        />
        <div
          className="absolute inset-0 border-4 border-indigo-600/20 rounded-full animate-ping"
          style={{ animationDuration: "2s" }}
        ></div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">
        Consulting the ancient texts...
      </p>
    </div>
  );
}

export default LoadingState;
