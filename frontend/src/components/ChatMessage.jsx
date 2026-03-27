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
          <div className="flex items-center justify-end">
            <div className="bg-[#A45A22] text-[#fff9ef] px-6 py-4 rounded-[2rem] rounded-tr-lg shadow-sm text-lg font-body max-w-2xl leading-relaxed">
              {message.content}
            </div>
            
          </div>
        ) : (
          <div className="space-y-4 w-full">
            <SafetyWarning isUnsafe={message.safetyWarning} />
            <AnswerCard
              answer={message.content}
              sources={message.sources || []}
              poses={message.poses || []}
              onFeedback={onFeedback}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
