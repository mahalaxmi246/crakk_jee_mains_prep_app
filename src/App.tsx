// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";

// ✅ Prefer importing modules without file extensions
import Home from "./pages/Home";
import Chatbots from "./pages/Chatbots";
import Contests from "./pages/Contests";
import ReferEarn from "./pages/ReferEarn";
import ChatInterface from "./pages/ChatInterface";
import DPPPage from "./pages/DPPPage";
import PYQPage from "./pages/PYQPage";
import DailyQuestionPage from "./pages/DailyQuestionPage";
import ChapterListPage from "./pages/ChapterListPage";
import QuestionListPage from "./pages/QuestionListPage";
import QuestionPage from "./pages/QuestionPage";
import ChapterReviewPage from "./pages/ChapterReviewPage";
import PYQChapterPage from "./pages/PYQChapterPage";
import ContestTestPage from "./pages/ContestTestPage";
import ContestSummaryPage from "./pages/ContestSummaryPage";
import ContestDetailedReportPage from "./pages/ContestDetailedReportPage";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";

import { AuthProvider } from "./contexts/AuthContext";



function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white relative">
          <Navbar />
          <main style={{ paddingTop: 64 }}>
            <Routes>
              {/* Core */}
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Chatbots */}
              <Route path="/chatbots" element={<Chatbots />} />
              <Route path="/chatbots/:type" element={<ChatInterface />} />
              <Route path="/chatbots/generator" element={<ChatInterface />} />
              <Route path="/chatbots/doubts" element={<ChatInterface />} />
              <Route path="/chatbots/summarizer" element={<ChatInterface />} />
              <Route path="/chatbots/planner" element={<ChatInterface />} />

              {/* Contests */}
              <Route path="/contests" element={<Contests />} />
              <Route path="/contests/:contestId/test" element={<ContestTestPage />} />
              <Route path="/contests/:contestId/summary" element={<ContestSummaryPage />} />
              <Route path="/contests/:contestId/detailed-report" element={<ContestDetailedReportPage />} />
              <Route path="/contests/:contestId/join" element={<ContestTestPage />} />

              {/* Refer */}
              <Route path="/refer-earn" element={<ReferEarn />} />

              {/* DPP (topic/chapter navigation) */}
              <Route path="/dpp/:subject" element={<DPPPage />} />
              <Route path="/dpp/:subject/:topic" element={<ChapterListPage />} />
              <Route path="/dpp/:subject/:topic/:chapter" element={<QuestionListPage />} />
              <Route path="/dpp/:subject/:topic/:chapter/review" element={<ChapterReviewPage />} />

              {/* PYQ */}
              <Route path="/pyq/:subject" element={<PYQPage />} />
              <Route path="/pyq/:subject/:chapter" element={<PYQChapterPage />} />

              {/* Daily Question (recommended path) */}
              <Route path="/dpp/:subject/daily" element={<DailyQuestionPage />} />

              {/* Back-compat: redirect old path to the new one */}
              <Route
                path="/daily-question/:subject"
                element={<Navigate to="/dpp/:subject/daily" replace />}
              />

              {/* Individual question page */}
              <Route path="/question/:questionId" element={<QuestionPage />} />

              {/* 404 → home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
