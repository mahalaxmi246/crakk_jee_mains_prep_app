import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, AlertTriangle, Menu, X, ChevronDown } from 'lucide-react';

const ContestTestPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, string>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([1]));
  const [timeRemaining, setTimeRemaining] = useState(3 * 60 * 60); // 3 hours in seconds
  const [showEndTestModal, setShowEndTestModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [panelScrollPosition, setPanelScrollPosition] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(Date.now());
  const panelScrollRef = useRef<HTMLDivElement>(null);
  const mobileOpenerRef = useRef<HTMLButtonElement>(null);

  // Get current subject based on current question
  const getCurrentSubject = () => {
    if (currentQuestion <= 30) return 'Physics';
    if (currentQuestion <= 60) return 'Chemistry';
    return 'Mathematics';
  };

  // Mock contest data
  const contestData = {
    id: contestId,
    name: 'JEE Mock Test #12',
    totalQuestions: 90,
    subjects: {
      Physics: { start: 1, end: 30, color: 'bg-green-500' },
      Chemistry: { start: 31, end: 60, color: 'bg-orange-500' },
      Mathematics: { start: 61, end: 90, color: 'bg-blue-500' }
    }
  };

  // Mock questions
  const questions = Array.from({ length: 90 }, (_, i) => ({
    id: i + 1,
    subject: i < 30 ? 'Physics' : i < 60 ? 'Chemistry' : 'Mathematics',
    question: `Sample question ${i + 1} for ${i < 30 ? 'Physics' : i < 60 ? 'Chemistry' : 'Mathematics'}. This is a placeholder question text that would contain the actual problem statement.`,
    options: [
      { id: 'A', text: `Option A for question ${i + 1}` },
      { id: 'B', text: `Option B for question ${i + 1}` },
      { id: 'C', text: `Option C for question ${i + 1}` },
      { id: 'D', text: `Option D for question ${i + 1}` }
    ]
  }));

  const currentQuestionData = questions[currentQuestion - 1];

  // Timer logic
  useEffect(() => {
    const savedStartTime = localStorage.getItem(`contest_${contestId}_start_time`);
    const savedAnswers = localStorage.getItem(`contest_${contestId}_answers`);
    const savedSubmittedAnswers = localStorage.getItem(`contest_${contestId}_submitted_answers`);
    const savedVisitedQuestions = localStorage.getItem(`contest_${contestId}_visited_questions`);
    
    if (savedStartTime) {
      const elapsed = Math.floor((Date.now() - parseInt(savedStartTime)) / 1000);
      const remaining = Math.max(0, 3 * 60 * 60 - elapsed);
      setTimeRemaining(remaining);
      startTimeRef.current = parseInt(savedStartTime);
    } else {
      localStorage.setItem(`contest_${contestId}_start_time`, startTimeRef.current.toString());
    }

    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    
    if (savedSubmittedAnswers) {
      setSubmittedAnswers(JSON.parse(savedSubmittedAnswers));
    }
    
    if (savedVisitedQuestions) {
      setVisitedQuestions(new Set(JSON.parse(savedVisitedQuestions)));
    } else {
      setVisitedQuestions(new Set([1])); // Mark question 1 as visited initially
    }

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, 3 * 60 * 60 - elapsed);
      
      setTimeRemaining(remaining);

      // Warnings
      if (remaining === 30 * 60) { // 30 minutes
        setWarningMessage('30 minutes remaining!');
        setShowWarningModal(true);
      } else if (remaining === 5 * 60) { // 5 minutes
        setWarningMessage('5 minutes remaining!');
        setShowWarningModal(true);
      }

      // Auto-submit at 0
      if (remaining === 0) {
        handleAutoSubmit();
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [contestId]);

  // Save answers continuously
  useEffect(() => {
    localStorage.setItem(`contest_${contestId}_answers`, JSON.stringify(answers));
  }, [answers, contestId]);

  // Auto-open subject for desktop/mobile when currentQuestion changes
  useEffect(() => {
    setExpandedSubject(getCurrentSubject());
    // also keep panel scrolled to show current question
    setTimeout(() => {
      const el = panelScrollRef.current?.querySelector(`[data-question="${currentQuestion}"]`) as HTMLElement | null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 80);
  }, [currentQuestion]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionId: string) => {
    // Don't allow changes if answer is already submitted
    if (submittedAnswers[currentQuestion]) {
      return;
    }
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionId
    }));
  };
  
  const handleSubmitAnswer = () => {
    const selectedAnswer = answers[currentQuestion];
    if (!selectedAnswer) return;
    
    // Prevent double submission
    if (submittedAnswers[currentQuestion]) return;
    
    setSubmittedAnswers(prev => ({
      ...prev,
      [currentQuestion]: selectedAnswer
    }));
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
      setVisitedQuestions(prev => new Set([...prev, currentQuestion - 1]));
    }
  };

  const handleNext = () => {
    if (currentQuestion < contestData.totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setVisitedQuestions(prev => new Set([...prev, currentQuestion + 1]));
    }
  };

  const handleQuestionJump = (questionNumber: number) => {
    setCurrentQuestion(questionNumber);
    setVisitedQuestions(prev => new Set([...prev, questionNumber]));
    setIsMobilePanelOpen(false);
  };

  const handlePanelOpen = () => {
    setIsMobilePanelOpen(true);
    // Set current subject as expanded by default
    setExpandedSubject(getCurrentSubject());
    // Prevent body scroll when panel is open
    document.body.style.overflow = 'hidden';
    
    // Restore scroll position after panel renders
    setTimeout(() => {
      if (panelScrollRef.current) {
        panelScrollRef.current.scrollTop = panelScrollPosition;
        
        // Auto-scroll to current question
        const currentQuestionElement = panelScrollRef.current.querySelector(`[data-question="${currentQuestion}"]`);
        if (currentQuestionElement) {
          currentQuestionElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 100);
  };

  const handlePanelClose = () => {
    // Save scroll position before closing
    if (panelScrollRef.current) {
      setPanelScrollPosition(panelScrollRef.current.scrollTop);
    }
    
    setIsMobilePanelOpen(false);
    
    // Restore body scroll
    document.body.style.overflow = 'unset';
    
    // Restore focus to opener
    if (mobileOpenerRef.current) {
      mobileOpenerRef.current.focus();
    }
  };

  // Handle scroll position saving
  const handleScroll = () => {
    if (panelScrollRef.current) {
      setPanelScrollPosition(panelScrollRef.current.scrollTop);
    }
  };

  const handlePanelKeyDown = (e: React.KeyboardEvent) => {
    if (!panelScrollRef.current) return;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        panelScrollRef.current.scrollBy({ top: -100, behavior: 'smooth' });
        break;
      case 'ArrowDown':
        e.preventDefault();
        panelScrollRef.current.scrollBy({ top: 100, behavior: 'smooth' });
        break;
      case 'PageUp':
        e.preventDefault();
        panelScrollRef.current.scrollBy({ top: -panelScrollRef.current.clientHeight, behavior: 'smooth' });
        break;
      case 'PageDown':
        e.preventDefault();
        panelScrollRef.current.scrollBy({ top: panelScrollRef.current.clientHeight, behavior: 'smooth' });
        break;
      case 'Home':
        e.preventDefault();
        panelScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'End':
        e.preventDefault();
        panelScrollRef.current.scrollTo({ top: panelScrollRef.current.scrollHeight, behavior: 'smooth' });
        break;
      case 'Escape':
        e.preventDefault();
        if (isMobilePanelOpen) {
          handlePanelClose();
        }
        break;
    }
  };

  const handleEndTest = () => {
    setShowEndTestModal(true);
  };

  const handleConfirmEndTest = () => {
    submitTest();
  };

  const handleAutoSubmit = () => {
    submitTest();
  };

  const submitTest = () => {
    // Clear saved data
    localStorage.removeItem(`contest_${contestId}_start_time`);
    localStorage.removeItem(`contest_${contestId}_answers`);
    localStorage.removeItem(`contest_${contestId}_submitted_answers`);
    localStorage.removeItem(`contest_${contestId}_visited_questions`);
    
    // Navigate to summary
    navigate(`/contests/${contestId}/summary`, {
      state: { answers: submittedAnswers, timeSpent: 3 * 60 * 60 - timeRemaining }
    });
  };

  const getQuestionState = (questionNumber: number) => {
    if (submittedAnswers[questionNumber]) return 'answered';
    if (questionNumber === currentQuestion) return 'current';
    if (visitedQuestions.has(questionNumber)) return 'visited';
    return 'unvisited';
  };

  const getQuestionStateColor = (state: string) => {
    switch (state) {
      case 'answered': return 'bg-green-500 text-white';
      case 'current': return 'bg-purple-500 text-white';
      case 'visited': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }
  };

  const getSubjectStatusCounts = (subject: string) => {
    const range = contestData.subjects[subject as keyof typeof contestData.subjects];
    let attempted = 0;
    let visited = 0;
    let unvisited = 0;
    
    for (let i = range.start; i <= range.end; i++) {
      if (submittedAnswers[i]) {
        attempted++;
      } else if (visitedQuestions.has(i)) {
        visited++;
      } else {
        unvisited++;
      }
    }
    
    return { attempted, visited, unvisited };
  };

  const getSubjectStats = () => {
    const stats: Record<string, number> = {};
    Object.entries(contestData.subjects).forEach(([subject, range]) => {
      stats[subject] = getSubjectStatusCounts(subject).attempted;
    });
    return stats;
  };

  const subjectStats = getSubjectStats();
  const totalAnswered = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/contests" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">{contestData.name}</h1>
          </div>
          
          {/* Mobile panel toggle */}
          <button
            ref={mobileOpenerRef}
            onClick={handlePanelOpen}
            className="lg:hidden bg-purple-600 text-white p-2 rounded-lg"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Question Area */}
        <div className="flex-1 flex flex-col">
          {/* Question Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Question {currentQuestion} of {contestData.totalQuestions}
                </h2>
                <p className="text-sm text-gray-600">{currentQuestionData.subject}</p>
              </div>
              <div className="lg:hidden">
                <div className="flex items-center space-x-2 text-lg font-mono">
                  <Clock size={20} className="text-purple-600" />
                  <span className={timeRemaining < 5 * 60 ? 'text-red-600' : 'text-gray-900'}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <p className="text-lg leading-relaxed text-gray-900 mb-6">
                  {currentQuestionData.question}
                </p>

                <div className="space-y-3">
                  {currentQuestionData.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        answers[currentQuestion] === option.id && !submittedAnswers[currentQuestion]
                          ? 'border-purple-500 bg-purple-50'
                          : submittedAnswers[currentQuestion] === option.id
                          ? 'border-green-500 bg-green-50'
                          : submittedAnswers[currentQuestion]
                          ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion}`}
                        value={option.id}
                        checked={answers[currentQuestion] === option.id}
                        onChange={() => handleAnswerSelect(option.id)}
                        disabled={!!submittedAnswers[currentQuestion]}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-medium text-gray-900">{option.id}.</span>
                      <span className="text-gray-900">{option.text}</span>
                      {submittedAnswers[currentQuestion] === option.id && (
                        <div className="ml-auto flex items-center space-x-1 text-green-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Submitted</span>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                
                {/* Submit Button */}
                <div className="mt-6">
                  {submittedAnswers[currentQuestion] ? (
                    <div className="w-full bg-green-50 text-green-700 py-3 px-4 rounded-lg border border-green-200 flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Answer Submitted</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!answers[currentQuestion]}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      Submit Answer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Footer */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 1}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
                <span>Previous</span>
              </button>

              <button
                onClick={handleEndTest}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                End Test
              </button>

              <button
                onClick={handleNext}
                disabled={currentQuestion === contestData.totalQuestions}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Desktop (accordion like mobile) */}
        <div className="hidden lg:block w-80 bg-white border-l border-gray-200 flex flex-col h-full min-h-0">
          {/* Sticky header (timer) */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0 sticky top-0 bg-white z-10">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock size={24} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Time Remaining</span>
              </div>
              <div className={`text-3xl font-mono font-bold ${timeRemaining < 5 * 60 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          {/* Single scrollable region (same as mobile) */}
          <div
            ref={panelScrollRef}
            className="flex-1 overflow-y-auto p-4 min-h-0"
            onScroll={handleScroll}
            onKeyDown={handlePanelKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Question navigation"
            style={{ scrollbarWidth: 'auto' }}
          >
            {Object.entries(contestData.subjects).map(([subject, range]) => (
              <div key={subject} className="mb-6">
                {/* Accordion button */}
                <button
                  onClick={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-purple-500"
                  aria-expanded={expandedSubject === subject}
                  aria-controls={`subject-${subject.toLowerCase()}`}
                >
                  <h3 className="font-semibold text-gray-900">{subject}</h3>
                  <ChevronDown size={16} className={`transform transition-transform ${expandedSubject === subject ? 'rotate-180' : ''}`} />
                </button>

                <div
                  id={`subject-${subject.toLowerCase()}`}
                  className={`transition-all duration-200 overflow-hidden ${expandedSubject === subject ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {Array.from({ length: range.end - range.start + 1 }, (_, i) => {
                      const questionNumber = range.start + i;
                      const state = getQuestionState(questionNumber);
                      return (
                        <button
                          key={questionNumber}
                          onClick={() => handleQuestionJump(questionNumber)}
                          data-question={questionNumber}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${getQuestionStateColor(state)}`}
                          aria-label={`Question ${questionNumber}, ${state}`}
                        >
                          {questionNumber}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Attempted:</span>
                        </div>
                        <span className="font-medium">{getSubjectStatusCounts(subject).attempted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Visited:</span>
                        </div>
                        <span className="font-medium">{getSubjectStatusCounts(subject).visited}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                          <span>Unvisited:</span>
                        </div>
                        <span className="font-medium">{getSubjectStatusCounts(subject).unvisited}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Overall totals & legend - same as before */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Overall Summary</h4>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Total Attempted:</span>
                    </div>
                    <span className="font-bold text-green-600">{Object.keys(submittedAnswers).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-700">Total Visited:</span>
                    </div>
                    <span className="font-bold text-yellow-600">{visitedQuestions.size - Object.keys(submittedAnswers).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                      <span className="text-gray-700">Total Unvisited:</span>
                    </div>
                    <span className="font-bold text-gray-600">{contestData.totalQuestions - visitedQuestions.size}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>Unvisited</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Panel */}
        {isMobilePanelOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" 
            onClick={handlePanelClose}
            onKeyDown={handlePanelKeyDown}
          >
            {/* OUTER DRAWER - this is now the single scrollable element */}
            <div 
              ref={panelScrollRef}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '100vh' }}
              tabIndex={0}
              onKeyDown={handlePanelKeyDown}
              role="dialog"
              aria-label="Question panel"
            >
              {/* Sticky Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-white">
                <h3 className="font-semibold text-gray-900">Question Panel</h3>
                <button
                  onClick={handlePanelClose}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close panel"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Timer - Mobile */}
              <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-white">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock size={24} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Time Remaining</span>
                  </div>
                  <div className={`text-3xl font-mono font-bold ${timeRemaining < 5 * 60 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>

              {/* Mobile Accordion Subjects */}
              <div className="p-4">
                <>
                {Object.entries(contestData.subjects).map(([subject, range], index) => (
                  <div key={subject} className="mb-6">
                    <button
                      onClick={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-purple-500"
                      aria-expanded={expandedSubject === subject}
                      aria-controls={`subject-${subject.toLowerCase()}`}
                    >
                      <h3 className="font-semibold text-gray-900">{subject}</h3>
                      <ChevronDown 
                        size={16} 
                        className={`transform transition-transform ${expandedSubject === subject ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    <div 
                      id={`subject-${subject.toLowerCase()}`}
                      className={`transition-all duration-300 overflow-hidden ${
                        expandedSubject === subject ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {Array.from({ length: range.end - range.start + 1 }, (_, i) => {
                          const questionNumber = range.start + i;
                          const state = getQuestionState(questionNumber);
                          return (
                            <button
                              key={questionNumber}
                              onClick={() => handleQuestionJump(questionNumber)}
                              data-question={questionNumber}
                              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${getQuestionStateColor(state)}`}
                              aria-label={`Question ${questionNumber}, ${state}`}
                            >
                              {questionNumber}
                            </button>
                          );
                        })}
                      </div>
                        
                        {/* Per-subject counters - Mobile */}
                        <div className="mt-3 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Attempted:</span>
                              </div>
                              <span className="font-medium">{getSubjectStatusCounts(subject).attempted}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span>Visited:</span>
                              </div>
                              <span className="font-medium">{getSubjectStatusCounts(subject).visited}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                                <span>Unvisited:</span>
                              </div>
                              <span className="font-medium">{getSubjectStatusCounts(subject).unvisited}</span>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                ))}
                
                {/* Overall Totals - Mobile */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Overall Summary</h4>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">Total Attempted:</span>
                        </div>
                        <span className="font-bold text-green-600">{Object.keys(submittedAnswers).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-700">Total Visited:</span>
                        </div>
                        <span className="font-bold text-yellow-600">{visitedQuestions.size - Object.keys(submittedAnswers).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                          <span className="text-gray-700">Total Unvisited:</span>
                        </div>
                        <span className="font-bold text-gray-600">{contestData.totalQuestions - visitedQuestions.size}</span>
                      </div>
                    </div>
                  </div>
                </div>
                </>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* End Test Modal */}
      {showEndTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle size={24} className="text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">End Test</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end the test? You have answered {totalAnswered} out of {contestData.totalQuestions} questions.
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEndTestModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={handleConfirmEndTest}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                End Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock size={24} className="text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Time Warning</h2>
            </div>
            <p className="text-gray-600 mb-6">{warningMessage}</p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestTestPage;
