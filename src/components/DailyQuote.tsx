import React from 'react';
import { Quote } from 'lucide-react';

const DailyQuote: React.FC = () => {
  const quotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle"
  ];

  const todayQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <section className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Quote size={32} className="text-purple-200" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Daily Motivation</h2>
          <blockquote className="text-lg leading-relaxed font-medium opacity-95">
            {todayQuote}
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default DailyQuote;