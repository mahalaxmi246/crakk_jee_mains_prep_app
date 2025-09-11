import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Target, TrendingUp, Heart, BarChart3, PieChart, Award, Eye, CheckCircle, XCircle } from 'lucide-react';

const ChapterReviewPage: React.FC = () => {
  const { subject, topic, chapter } = useParams<{ subject: string; topic: string; chapter: string }>();
  const [showLikedProblems, setShowLikedProblems] = useState(false);

  // Mock data - in real app, this would come from API
  const chapterData = {
    name: 'Complex Numbers',
    totalQuestions: 45,
    attemptedQuestions: 32,
    correctAnswers: 24,
    incorrectAnswers: 8,
    seenButNotAttempted: 13,
    accuracy: Math.round((24 / 32) * 100),
    progressPercentage: Math.round((32 / 45) * 100),
    
    difficultyBreakdown: {
      easy: { solved: 12, total: 15 },
      medium: { solved: 8, total: 20 },
      hard: { solved: 4, total: 10 }
    },
    
    jeeWeightage: {
      mains: { marks: '4-6', percentage: '2-3%' },
      advanced: { marks: '6-8', percentage: '3-4%' }
    },
    
    likedProblems: [
      { id: 1, preview: 'Find the modulus and argument of the complex number z = 3 + 4i', difficulty: 'Easy' },
      { id: 5, preview: 'If z₁ and z₂ are two complex numbers such that |z₁| = |z₂|...', difficulty: 'Medium' },
      { id: 12, preview: 'Prove that the roots of z⁴ + z³ + z² + z + 1 = 0 are...', difficulty: 'Hard' },
      { id: 18, preview: 'Find all complex numbers z such that z³ = z̄ (conjugate of z)', difficulty: 'Hard' }
    ]
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const chapterName = chapter?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const topicName = topic?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const subjectName = subject?.charAt(0).toUpperCase() + subject?.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to={`/dpp/${subject}/${topic}/${chapter}`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{chapterData.name} - Review</h1>
            <p className="text-gray-600 mt-2">{subjectName} • {topicName}</p>
          </div>
        </div>

        {/* Chapter Overview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Chapter Overview</h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{chapterData.totalQuestions}</div>
              <div className="text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{chapterData.attemptedQuestions}</div>
              <div className="text-gray-600">Questions Attempted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{chapterData.accuracy}%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{chapterData.progressPercentage}%</div>
              <div className="text-gray-600">Chapter Progress</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Question Analysis */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <BarChart3 size={24} className="text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Question Analysis</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle size={24} className="text-green-600" />
                    <span className="font-medium text-gray-900">Correct Submissions</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{chapterData.correctAnswers}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <XCircle size={24} className="text-red-600" />
                    <span className="font-medium text-gray-900">Incorrect Submissions</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{chapterData.incorrectAnswers}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Eye size={24} className="text-yellow-600" />
                    <span className="font-medium text-gray-900">Seen but Not Attempted</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{chapterData.seenButNotAttempted}</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Solved vs Unsolved</h3>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-green-500 h-6 rounded-l-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: `${(chapterData.correctAnswers / chapterData.totalQuestions) * 100}%` }}
                    >
                      {chapterData.correctAnswers}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Solved: {chapterData.correctAnswers}</span>
                    <span>Remaining: {chapterData.totalQuestions - chapterData.correctAnswers}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Tracking */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <Target size={24} className="text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">Chapter Completion</span>
                  <span className="text-lg font-bold text-purple-600">{chapterData.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-purple-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${chapterData.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{chapterData.attemptedQuestions}</div>
                  <div className="text-sm text-gray-600">Attempted</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{chapterData.totalQuestions - chapterData.attemptedQuestions}</div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Difficulty Breakdown */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-6">
                <PieChart size={24} className="text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Difficulty Breakdown</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Easy Questions</span>
                    <div className="text-sm text-gray-600">
                      {chapterData.difficultyBreakdown.easy.solved} of {chapterData.difficultyBreakdown.easy.total} solved
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((chapterData.difficultyBreakdown.easy.solved / chapterData.difficultyBreakdown.easy.total) * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Medium Questions</span>
                    <div className="text-sm text-gray-600">
                      {chapterData.difficultyBreakdown.medium.solved} of {chapterData.difficultyBreakdown.medium.total} solved
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round((chapterData.difficultyBreakdown.medium.solved / chapterData.difficultyBreakdown.medium.total) * 100)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Hard Questions</span>
                    <div className="text-sm text-gray-600">
                      {chapterData.difficultyBreakdown.hard.solved} of {chapterData.difficultyBreakdown.hard.total} solved
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {Math.round((chapterData.difficultyBreakdown.hard.solved / chapterData.difficultyBreakdown.hard.total) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* JEE Weightage Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center space-x-2 mb-6">
                <Award size={24} className="text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">JEE Weightage Insights</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">JEE Main</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expected Marks:</span>
                    <span className="font-bold text-blue-600">{chapterData.jeeWeightage.mains.marks} marks</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Weightage:</span>
                    <span className="font-bold text-blue-600">{chapterData.jeeWeightage.mains.percentage}</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">JEE Advanced</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expected Marks:</span>
                    <span className="font-bold text-purple-600">{chapterData.jeeWeightage.advanced.marks} marks</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Weightage:</span>
                    <span className="font-bold text-purple-600">{chapterData.jeeWeightage.advanced.percentage}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> This chapter has moderate weightage in both exams. Focus on mastering medium-level problems for optimal score improvement.
                </p>
              </div>
            </div>

            {/* Liked Problems */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Heart size={24} className="text-red-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Liked Problems</h2>
                </div>
                <span className="text-sm text-gray-600">{chapterData.likedProblems.length} problems</span>
              </div>
              
              <button
                onClick={() => setShowLikedProblems(!showLikedProblems)}
                className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors font-medium mb-4"
              >
                {showLikedProblems ? 'Hide' : 'View'} Liked Problems
              </button>
              
              {showLikedProblems && (
                <div className="space-y-3">
                  {chapterData.likedProblems.map((problem) => (
                    <Link
                      key={problem.id}
                      to={`/question/${problem.id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">{problem.preview}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <Heart size={16} className="text-red-500 fill-current mt-1 ml-2" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link
            to={`/dpp/${subject}/${topic}/${chapter}`}
            className="inline-flex items-center space-x-2 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            <span>Back to Chapter Questions</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChapterReviewPage;