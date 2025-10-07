// src/pages/Home.tsx
import React from "react";
import DailyQuote from "../components/DailyQuote";
import DPPSection from "../components/DPPSection";
import ChatbotPreview from "../components/ChatbotPreview";
import ReferEarnBanner from "../components/ReferEarnBanner";
import PYQSection from "../components/PYQSection";
import ContestGlimpse from "../components/ContestGlimpse";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ✅ Daily Motivation (fetched from FastAPI) */}
        <DailyQuote />

        {/* Your existing sections */}
        <DPPSection />
        <ChatbotPreview />
        <ReferEarnBanner />
        <PYQSection />
        <ContestGlimpse />
      </div>
    </div>
  );
};

export default Home;
