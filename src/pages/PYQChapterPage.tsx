import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Target, Filter, Play } from 'lucide-react';

const PYQChapterPage: React.FC = () => {
  const { subject, chapter } = useParams<{ subject: string; chapter: string }>();
  const location = useLocation();
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  // Restore filters from navigation state if returning from question page
  React.useEffect(() => {
    if (location.state) {
      if (location.state.difficultyFilter) {
        setSelectedDifficulty(location.state.difficultyFilter as any);
      }
    }
  }, [location.state]);

  // Mock questions data - in real app, this would come from API
  const questions = [
    {
      id: 1,
      preview: "If f(x) = x³ - 6x² + 9x + 1, then the number of critical points of f(x) is:",
      difficulty: 'Medium',
      date: '2024-01-27',
      shift: 'Shift 1',
      exam: 'JEE Main',
      solved: true
    },
    {
      id: 2,
      preview: "Find the value of limit as x approaches 0 of (sin x - x) / x³",
      difficulty: 'Hard',
      date: '2024-01-29',
      shift: 'Shift 2',
      exam: 'JEE Advanced',
      solved: false
    },
    {
      id: 3,
      preview: "The derivative of f(x) = x² sin(x) with respect to x is:",
      difficulty: 'Easy',
      date: '2023-04-11',
      shift: 'Shift 1',
      exam: 'JEE Main',
      solved: true
    },
    {
      id: 4,
      preview: "If y = e^(x²), then d²y/dx² at x = 1 equals:",
      difficulty: 'Medium',
      date: '2023-04-13',
      shift: 'Shift 2',
      exam: 'JEE Main',
      solved: false
    },
    {
      id: 5,
      preview: "The area bounded by y = x², y = 0, x = 1, and x = 2 is:",
      difficulty: 'Easy',
      date: '2023-05-28',
      shift: 'Shift 1',
      exam: 'JEE Advanced',
      solved: true
    },
    {
      id: 6,
      preview: "Find the maximum value of f(x) = x³ - 3x² + 2 on the interval [0, 3]",
      difficulty: 'Hard',
      date: '2023-05-29',
      shift: 'Shift 2',
      exam: 'JEE Advanced',
      solved: false
    },
    {
      id: 7,
      preview: "The equation of tangent to the curve y = x² at the point (2, 4) is:",
      difficulty: 'Easy',
      date: '2022-06-24',
      shift: 'Shift 1',
      exam: 'JEE Main',
      solved: true
    },
    {
      id: 8,
      preview: "Evaluate the integral ∫(x² + 2x + 1)dx from 0 to 2",
      difficulty: 'Medium',
      date: '2022-06-26',
      shift: 'Shift 2',
      exam: 'JEE Main',
      solved: false
    }
  ];

  const filteredQuestions = questions.filter((question) => {
    if (selectedDifficulty === 'all') return true;
    return question.difficulty.toLowerCase() === selectedDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getExamColor = (exam: string) => {
    return exam === 'JEE Main' ? 'text-blue-600 bg-blue-100' : 'text-purple-600 bg-purple-100';
  };

  const chapterName = chapter?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const subjectName = subject?.charAt(0).toUpperCase() + subject?.slice(1);

  const solvedCount = filteredQuestions.filter(q => q.solved).length;
  const totalQuestions = filteredQuestions.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to={`/pyq/${subject}`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{chapterName} - PYQs</h1>
            <p className="text-gray-600 mt-2">{subjectName} • Previous Year Questions</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalQuestions}</div>
              <div className="text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{solvedCount}</div>
              <div className="text-gray-600">Solved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{totalQuestions - solvedCount}</div>
              <div className="text-gray-600">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0}%
              </div>
              <div className="text-gray-600">Progress</div>
            </div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Filter size={20} className="text-gray-600" />
              <span className="font-medium text-gray-900">Difficulty:</span>
            </div>
            <div className="flex space-x-2">
              {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDifficulty === difficulty
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {difficulty === 'all' ? 'All' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getExamColor(question.exam)}`}>
                      {question.exam}
                    </span>
                    {question.solved && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        ✓ Solved
                      </span>
                    )}
                  </div>
                  
                  <p className="text-lg text-gray-900 mb-4 leading-relaxed">{question.preview}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{new Date(question.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{question.shift}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target size={16} />
                      <span>Question #{question.id}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-6">
                  <Link
                    to={`/question/${question.id}`}
                    state={{
                      source: 'pyq',
                      backTo: `/pyq/${subject}/${chapter}`,
                      subject: subject,
                      chapter: chapterName,
                      examFilter: 'all',
                      difficultyFilter: selectedDifficulty
                    }}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <Play size={16} />
                    <span>Solve</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-16">
            <Target size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600">Try adjusting your difficulty filter to see more questions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PYQChapterPage;