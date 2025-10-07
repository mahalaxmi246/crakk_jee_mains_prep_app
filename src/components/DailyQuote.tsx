import React, { useEffect, useState } from "react";
import { Quote, Shuffle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE

const DailyQuote: React.FC = () => {
  const [quote, setQuote] = useState<string>("Loading today's motivation...");
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch daily quote (same quote for everyone each day)
  const fetchDailyQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/daily-quote`);
      if (!response.ok) throw new Error("Failed to fetch daily quote");
      const data = await response.json();
      setQuote(data.quote);
    } catch (error) {
      console.error(error);
      setQuote("Stay motivated! ✨");
    } finally {
      setLoading(false);
    }
  };

  // Fetch random quote (when Shuffle is clicked)
  const fetchRandomQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/random-quote`);
      if (!response.ok) throw new Error("Failed to fetch random quote");
      const data = await response.json();
      setQuote(data.quote);
    } catch (error) {
      console.error(error);
      setQuote("Keep going! 🚀");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyQuote();
  }, []);

  return (
    <section className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Quote size={32} className="text-purple-200" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Daily Motivation</h2>
            <blockquote className="text-lg leading-relaxed font-medium opacity-95">
              {quote}
            </blockquote>
          </div>
        </div>
        <button
          onClick={fetchRandomQuote}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-xl"
          title="Get a new quote"
        >
          <Shuffle size={18} />
          {loading ? "Loading..." : "Shuffle"}
        </button>
      </div>
    </section>
  );
};

export default DailyQuote;
