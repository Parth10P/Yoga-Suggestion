import { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import ThemeToggle from "./components/ThemeToggle";
import SearchInput from "./components/SearchInput";
import LoadingState from "./components/LoadingState";
import ChatMessage from "./components/ChatMessage";
import { Home, MessageSquare, Layers, User } from "lucide-react";

function App() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleAsk = async () => {
    if (!query.trim()) return;

    const userMessage = {
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: query }),
      });

      const data = await response.json();

      const botMessage = {
        role: "bot",
        content: data.answer,
        safetyWarning: data.isUnsafe,
        sources: data.sources.map((s, i) => ({ id: i, title: s })),
        id: data.id,
        poses: data.poses,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching answer:", error);
      const errorMessage = {
        role: "bot",
        content: "Sorry, something went wrong. Please try again later.",
        safetyWarning: false,
        sources: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (questionId, type) => {
    if (!questionId) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          feedback: type,
        }),
      });
      alert("Thanks for your feedback!");
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] font-body flex flex-col selection:bg-[var(--color-primary)]/20 transition-colors duration-500">
      
      {/* Header Area */}
      <div
        className={`transition-all duration-500 flex flex-col items-center ${messages.length > 0 ? "py-4" : "flex-1 justify-center p-8"}`}
      >
        <Header hasResult={messages.length > 0} />
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg}
              onFeedback={(type) => handleFeedback(msg.id, type)}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <LoadingState />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Pill Input Bar */}
      <div className="fixed bottom-6 left-0 right-0 px-4 md:px-8 pointer-events-none flex justify-center z-20">
        <div className="max-w-3xl w-full pointer-events-auto">
          <SearchInput
            query={query}
            setQuery={setQuery}
            handleAsk={handleAsk}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
