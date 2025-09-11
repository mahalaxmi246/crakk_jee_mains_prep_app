import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home.tsx';
import Chatbots from './pages/Chatbots';
import Contests from './pages/Contests';
import ReferEarn from './pages/ReferEarn';
import ChatInterface from './pages/ChatInterface';
import DPPPage from './pages/DPPPage';
import PYQPage from './pages/PYQPage';
import DailyQuestionPage from './pages/DailyQuestionPage';
import ChapterListPage from './pages/ChapterListPage';
import QuestionListPage from './pages/QuestionListPage';
import QuestionPage from './pages/QuestionPage';
import ChapterReviewPage from './pages/ChapterReviewPage';
import PYQChapterPage from './pages/PYQChapterPage';
import ContestTestPage from './pages/ContestTestPage';
import ContestSummaryPage from './pages/ContestSummaryPage';
import ContestDetailedReportPage from './pages/ContestDetailedReportPage';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white relative">
          <Navbar />
          <main style={{ paddingTop: '64px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/chatbots" element={<Chatbots />} />
              <Route path="/chatbots/:type" element={<ChatInterface />} />
              <Route path="/chatbots/generator" element={<ChatInterface />} />
              <Route path="/chatbots/doubts" element={<ChatInterface />} />
              <Route path="/chatbots/summarizer" element={<ChatInterface />} />
              <Route path="/chatbots/planner" element={<ChatInterface />} />
              <Route path="/contests" element={<Contests />} />
              <Route path="/refer-earn" element={<ReferEarn />} />
              <Route path="/dpp/:subject" element={<DPPPage />} />
              <Route path="/dpp/:subject/:topic" element={<ChapterListPage />} />
              <Route path="/dpp/:subject/:topic/:chapter" element={<QuestionListPage />} />
              <Route path="/dpp/:subject/:topic/:chapter/review" element={<ChapterReviewPage />} />
              <Route path="/pyq/:subject" element={<PYQPage />} />
              <Route path="/pyq/:subject/:chapter" element={<PYQChapterPage />} />
              <Route path="/daily-question/:subject" element={<DailyQuestionPage />} />
              <Route path="/question/:questionId" element={<QuestionPage />} />
              <Route path="/contests/:contestId/test" element={<ContestTestPage />} />
              <Route path="/contests/:contestId/summary" element={<ContestSummaryPage />} />
              <Route path="/contests/:contestId/detailed-report" element={<ContestDetailedReportPage />} />
              <Route path="/contests/:contestId/join" element={<ContestTestPage />} />

            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;