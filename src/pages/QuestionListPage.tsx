import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Target, TrendingUp, CheckCircle, XCircle, Play, BarChart3 } from 'lucide-react';

const QuestionListPage: React.FC = () => {
  const { subject, topic, chapter } = useParams<{ subject: string; topic: string; chapter: string }>();
  const [likedQuestions, setLikedQuestions] = useState<Set<number>>(new Set());

  // Mock data - in real app, this would come from API
  const questions = [
    {
      id: 1,
      preview: "If f(x) = x³ - 6x² + 9x + 1, then the number of critical points of f(x) is:",
      difficulty: 'Medium',
      globalAccuracy: 68,
      solved: true,
      likes: 234,
      attempts: 1247,
      correctSolves: 848
    },
    {
      id: 2,
      preview: "Find the value of limit as x approaches 0 of (sin x - x) / x³",
      difficulty: 'Hard',
      globalAccuracy: 45,
      solved: false,
      likes: 189,
      attempts: 892,
      correctSolves: 401
    },
    {
      id: 3,
      preview: "The derivative of f(x) = x² sin(x) with respect to x is:",
      difficulty: 'Easy',
      globalAccuracy: 82,
      solved: true,
      likes: 156,
      attempts: 1456,
      correctSolves: 1194
    },
    {
      id: 4,
      preview: "If y = e^(x²), then d²y/dx² at x = 1 equals:",
      difficulty: 'Medium',
      globalAccuracy: 61,
      solved: false,
      likes: 203,
      attempts: 1089,
      correctSolves: 664
    },
    {
      id: 5,
      preview: "The area bounded by y = x², y = 0, x = 1, and x = 2 is:",
      difficulty: 'Easy',
      globalAccuracy: 78,
      solved: true,
      likes: 178,
      attempts: 1334,
      correctSolves: 1040
    },
    {
      id: 6,
      preview: "Find the maximum value of f(x) = x³ - 3x² + 2 on the interval [0, 3]",
      difficulty: 'Hard',
      globalAccuracy: 52,
      solved: false,
      likes: 267,
      attempts: 756,
      correctSolves: 393
    },
    {
      id: 7,
      preview: "The equation of tangent to the curve y = x² at the point (2, 4) is:",
      difficulty: 'Easy',
      globalAccuracy: 85,
      solved: true,
      likes: 145,
      attempts: 1523,
      correctSolves: 1295
    },
    {
      id: 8,
      preview: "Evaluate the integral ∫(x² + 2x + 1)dx from 0 to 2",
      difficulty: 'Medium',
      globalAccuracy: 72,
      solved: false,
      likes: 198,
      attempts: 1167,
      correctSolves: 840
    }
  ];

  const handleLike = (questionId: number) => {
    const newLikedQuestions = new Set(likedQuestions);
    if (newLikedQuestions.has(questionId)) {
      newLikedQuestions.delete(questionId);
    } else {
      newLikedQuestions.add(questionId);
    }
    setLikedQuestions(newLikedQuestions);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const chapterName = chapter?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const topicName = topic?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const subjectName = subject?.charAt(0).toUpperCase() + subject?.slice(1);

  const solvedCount = questions.filter(q => q.solved).length;
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to={`/dpp/${subject}/${topic}`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-4xl font-bold text-gray-900">{chapterName}</h1>
            <Link
              to={`/dpp/${subject}/${topic}/${chapter}/review`}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium w-fit"
            >
              <BarChart3 size={16} />
              <span>Review</span>
            </Link>
          </div>
        </div>
        
        {/* Subject and Topic Info */}
        <div className="mb-8">
          <div>
            <p className="text-gray-600 mt-2">{subjectName} • {topicName}</p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Progress</h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{solvedCount}/{totalQuestions}</div>
              <div className="text-sm text-gray-600">Questions Solved</div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(solvedCount / totalQuestions) * 100}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-gray-900">{Math.round((solvedCount / totalQuestions) * 100)}%</div>
              <div className="text-gray-600">Completion</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{questions.filter(q => q.difficulty === 'Easy' && q.solved).length}</div>
              <div className="text-gray-600">Easy Solved</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{questions.filter(q => q.difficulty === 'Hard' && q.solved).length}</div>
              <div className="text-gray-600">Hard Solved</div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-start space-x-4">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {question.solved ? (
                    <CheckCircle size={24} className="text-green-600" />
                  ) : (
                    <XCircle size={24} className="text-gray-400" />
                  )}
                </div>

                {/* Question Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-lg text-gray-900 mb-2 leading-relaxed">{question.preview}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Target size={16} />
                          <span>{question.attempts} attempts</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <TrendingUp size={16} className={getAccuracyColor(question.globalAccuracy)} />
                          <span className={`font-medium ${getAccuracyColor(question.globalAccuracy)}`}>
                            {question.globalAccuracy}% accuracy
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 ml-4">
                      <button
                        onClick={() => handleLike(question.id)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                          likedQuestions.has(question.id)
                            ? 'bg-red-50 text-red-600'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Heart size={16} className={likedQuestions.has(question.id) ? 'fill-current' : ''} />
                        <span className="text-sm">
                          {question.likes + (likedQuestions.has(question.id) ? 1 : 0)}
                        </span>
                      </button>

                      <Link
                        to={`/question/${question.id}`}
                        className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        <Play size={16} />
                        <span>Solve</span>
                      </Link>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>{question.correctSolves} solved correctly</span>
                      <span>•</span>
                      <span>Question #{question.id}</span>
                    </div>
                    <div className={`font-medium ${question.solved ? 'text-green-600' : 'text-gray-500'}`}>
                      {question.solved ? '✅ Solved' : '⏳ Not Attempted'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Summary */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chapter Summary</h2>
            <div className="grid md:grid-cols-4 gap-6 text-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 mb-1">{totalQuestions}</div>
                <div className="text-gray-600">Total Questions</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 mb-1">{solvedCount}</div>
                <div className="text-gray-600">Solved</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">{totalQuestions - solvedCount}</div>
                <div className="text-gray-600">Remaining</div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {Math.round(questions.reduce((sum, q) => sum + q.globalAccuracy, 0) / questions.length)}%
                </div>
                <div className="text-gray-600">Avg Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionListPage;