import React from 'react';
import DailyQuote from '../components/DailyQuote';
import DPPSection from '../components/DPPSection';
import ChatbotPreview from '../components/ChatbotPreview';
import ReferEarnBanner from '../components/ReferEarnBanner';
import PYQSection from '../components/PYQSection';
import ContestGlimpse from '../components/ContestGlimpse';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <DailyQuote />
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