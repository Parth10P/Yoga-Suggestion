import { AlertTriangle } from "lucide-react";

function SafetyWarning({ isUnsafe }) {
  if (!isUnsafe) return null;

  return (
    <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-6 flex flex-col md:flex-row gap-4 items-start md:items-center shadow-sm">
      <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full shrink-0 text-red-600 dark:text-red-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-red-900 dark:text-red-200 text-lg">
          Safety First
        </h3>
        <p className="text-red-700 dark:text-red-300/80 leading-relaxed mt-1">
          This pose may not be suitable for existing injuries. Please consult a
          healthcare professional before attempting.
        </p>
      </div>
    </div>
  );
}

export default SafetyWarning;
