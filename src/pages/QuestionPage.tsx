import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Heart, Target, TrendingUp, Lightbulb, BookOpen, MessageCircle, ThumbsUp, Check, Clock } from 'lucide-react';

const QuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Extract navigation state from location
  const navigationState = (location.state || {}) as {
    source?: string;
    backTo?: string;
    subject?: string;
    chapter?: string;
    examFilter?: string;
    difficultyFilter?: string;
  };

  // Determine back URL - default to PYQ list if no specific back URL
  const backUrl = navigationState.backTo || '/pyq/mathematics';

  // Prepare state to pass back when returning
  const returnState = navigationState.source === 'pyq' ? {
    examFilter: navigationState.examFilter,
    difficultyFilter: navigationState.difficultyFilter
  } : undefined;

  // Mock question data - in real app, this would come from API based on questionId
  const questionData = {
    id: parseInt(questionId || '1'),
    chapter: 'Differential Calculus',
    subject: 'Mathematics',
    topic: 'Calculus',
    difficulty: 'Medium',
    // PYQ-specific fields
    datePublished: '2024-01-27',
    shift: 'Shift 1',
    exam: 'JEE Main',
    // DPP-specific fields
    attempted: 1247,
    solved: 848,
    question: 'If f(x) = x³ - 6x² + 9x + 1, then the number of critical points of f(x) is:',
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '2' },
      { id: 'D', text: '3' }
    ],
    correctAnswer: 'C',
    hint: 'Find f\'(x) and set it equal to zero to find critical points. Remember that critical points occur where the derivative is zero or undefined.',
    solution: `To find critical points, we need to find where f'(x) = 0.

Given: f(x) = x³ - 6x² + 9x + 1

Step 1: Find the derivative
f'(x) = 3x² - 12x + 9

Step 2: Set f'(x) = 0
3x² - 12x + 9 = 0

Step 3: Simplify by dividing by 3
x² - 4x + 3 = 0

Step 4: Factor the quadratic
(x - 1)(x - 3) = 0

Step 5: Solve for x
x = 1 or x = 3

Therefore, there are 2 critical points at x = 1 and x = 3.`,
    likes: 234,
    tags: ['derivatives', 'critical-points', 'calculus']
  };

  // Determine if this is a PYQ or DPP question
  const isPYQ = navigationState.source === 'pyq';
  
  // Calculate accuracy only for DPP questions
  const accuracy = !isPYQ && questionData.attempted > 0 
    ? Math.round((questionData.solved / questionData.attempted) * 100) 
    : 0;

  const comments = [
    {
      id: 1,
      username: 'Rahul_JEE2025',
      timestamp: '2 hours ago',
      content: 'Great question! The step-by-step solution really helped me understand how to find critical points systematically.',
      likes: 12,
      replies: [
        {
          id: 11,
          username: 'Priya_Math',
          timestamp: '1 hour ago',
          content: 'I agree! I was making an error in the factoring step, but now I understand.',
          likes: 5
        }
      ]
    },
    {
      id: 2,
      username: 'Arjun_Calculus',
      timestamp: '4 hours ago',
      content: 'Can someone explain why we don\'t need to check the second derivative test here? Is it just because the question only asks for the number of critical points?',
      likes: 8,
      replies: [
        {
          id: 21,
          username: 'TeacherSarah',
          timestamp: '3 hours ago',
          content: 'Exactly! The question only asks for the number of critical points, not their nature (max/min). We only need f\'(x) = 0.',
          likes: 15
        }
      ]
    },
    {
      id: 3,
      username: 'Sneha_Maths',
      timestamp: '6 hours ago',
      content: 'This type of question frequently appears in JEE Main. Thanks for the clear explanation!',
      likes: 18,
      replies: []
    }
  ];

  const handleSubmit = () => {
    if (selectedOption) {
      setIsSubmitted(true);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      // In real app, this would add comment to database
      setNewComment('');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {/* Breadcrumb */}
        {navigationState.source === 'pyq' && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link to="/pyq/mathematics" className="hover:text-purple-600 transition-colors">
              PYQs
            </Link>
            <span>→</span>
            <Link 
              to={backUrl} 
              state={{ ...returnState, source: 'pyq-return' }}
              className="hover:text-purple-600 transition-colors"
            >
              {navigationState.chapter || 'Chapter'}
            </Link>
            <span>→</span>
            <span className="text-gray-900 font-medium">Question #{questionData.id}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to={backUrl}
            state={{ ...returnState, source: 'pyq-return' }}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Question #{questionData.id}</h1>
            <p className="text-gray-600 mt-1">{questionData.subject} • {questionData.topic} • {questionData.chapter}</p>
          </div>
        </div>

        {/* Question Info Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(questionData.difficulty)}`}>
                {questionData.difficulty}
              </span>
              <div className="flex flex-wrap gap-2">
                {questionData.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                <span>{questionData.likes + (isLiked ? 1 : 0)}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {isPYQ ? (
              // PYQ-specific fields
              <>
                {questionData.datePublished && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock size={16} />
                    <span>{new Date(questionData.datePublished).toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                )}
                {questionData.shift && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Target size={16} />
                    <span>{questionData.shift}</span>
                  </div>
                )}
                {questionData.exam && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <BookOpen size={16} />
                    <span>{questionData.exam}</span>
                  </div>
                )}
              </>
            ) : (
              // DPP-specific fields
              <>
                {questionData.attempted && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Target size={16} />
                    <span>{questionData.attempted} attempts</span>
                  </div>
                )}
                {questionData.solved && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Check size={16} />
                    <span>{questionData.solved} solves</span>
                  </div>
                )}
                {questionData.attempted > 0 && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <TrendingUp size={16} />
                    <span>{accuracy}% accuracy</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Question Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{questionData.question}</h3>
          
          <div className="space-y-3 mb-6">
            {questionData.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedOption === option.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  isSubmitted
                    ? option.id === questionData.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : selectedOption === option.id && option.id !== questionData.correctAnswer
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  disabled={isSubmitted}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium text-gray-900">{option.id}.</span>
                <span className="text-gray-900">{option.text}</span>
              </label>
            ))}
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          ) : (
            <div className={`p-4 rounded-lg ${
              selectedOption === questionData.correctAnswer
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium ${
                selectedOption === questionData.correctAnswer ? 'text-green-800' : 'text-red-800'
              }`}>
                {selectedOption === questionData.correctAnswer
                  ? '🎉 Correct! Well done!'
                  : `❌ Incorrect. The correct answer is ${questionData.correctAnswer}.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Helper Tools */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors font-medium mb-4"
            >
              <Lightbulb size={20} />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>
            
            {showHint && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-800">{questionData.hint}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors font-medium mb-4"
            >
              <BookOpen size={20} />
              <span>{showSolution ? 'Hide Solution' : 'Show Solution'}</span>
            </button>
            
            {showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <pre className="text-gray-800 whitespace-pre-wrap font-sans text-sm leading-relaxed">{questionData.solution}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Discussion Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <MessageCircle size={24} className="text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">Discussion</h3>
            <span className="text-gray-500">({comments.length})</span>
          </div>

          {/* Add Comment */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, ask a question, or help others understand this problem..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </form>

          {/* Comments */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {comment.username.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{comment.username}</span>
                      <span className="text-gray-500 text-sm">{comment.timestamp}</span>
                    </div>
                    
                    <p className="text-gray-800 mb-3 leading-relaxed">{comment.content}</p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-colors">
                        <ThumbsUp size={14} />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="text-gray-500 hover:text-purple-600 transition-colors">
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white font-medium text-xs">
                              {reply.username.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">{reply.username}</span>
                                <span className="text-gray-500 text-xs">{reply.timestamp}</span>
                              </div>
                              
                              <p className="text-gray-800 text-sm mb-2 leading-relaxed">{reply.content}</p>
                              
                              <button className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-colors text-xs">
                                <ThumbsUp size={12} />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;