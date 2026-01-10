import { Leaf } from "lucide-react";

function Header({ hasResult }) {
  return (
    <div
      className={`text-center mb-12 transition-all duration-500 ${
        hasResult ? "mt-4 mb-8" : "mt-20"
      }`}
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white animate-float">
          <Leaf className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          ZenFlow Yoga
        </h1>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
        Your personal AI yoga guide for safe and mindful practice.
      </p>
    </div>
  );
}

export default Header;
