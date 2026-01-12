import { useState, useRef, useEffect } from "react";
import Header from "./components/Header";
import ThemeToggle from "./components/ThemeToggle";
import SearchInput from "./components/SearchInput";
import LoadingState from "./components/LoadingState";
import SafetyWarning from "./components/SafetyWarning";
import AnswerCard from "./components/AnswerCard";

function App() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  const [questionId, setQuestionId] = useState(null);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResult(null);
    setQuestionId(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: query }),
      });

      const data = await response.json();

      setResult({
        answer: data.answer,
        safetyWarning: data.isUnsafe,
        sources: data.sources.map((s, i) => ({ id: i, title: s })),
      });
      setQuestionId(data.id);
    } catch (error) {
      console.error("Error fetching answer:", error);
      setResult({
        answer: "Sorry, something went wrong. Please try again later.",
        safetyWarning: false,
        sources: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (type) => {
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

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 flex flex-col">
      <div className="w-full h-full flex-1 flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-500">
        <ThemeToggle />
        <Header hasResult={!!result} />

        <SearchInput
          query={query}
          setQuery={setQuery}
          handleAsk={handleAsk}
          isLoading={isLoading}
        />

        {isLoading && <LoadingState />}

        {result && !isLoading && (
          <div
            ref={resultRef}
            className="w-full max-w-3xl mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards"
          >
            <SafetyWarning isUnsafe={result.safetyWarning} />
            <AnswerCard
              answer={result.answer}
              sources={result.sources}
              onFeedback={handleFeedback}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
