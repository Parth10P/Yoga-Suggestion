import AnswerCard from "./AnswerCard";
import SafetyWarning from "./SafetyWarning";
import { User } from "lucide-react";

function ChatMessage({ message, onFeedback }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      } mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isUser ? "items-end" : "items-start"}`}
      >
        {isUser ? (
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-lg text-lg">
              {message.content}
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            <SafetyWarning isUnsafe={message.safetyWarning} />
            <AnswerCard
              answer={message.content}
              sources={message.sources || []}
              onFeedback={onFeedback}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
