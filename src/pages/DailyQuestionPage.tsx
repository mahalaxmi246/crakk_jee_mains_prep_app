import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Target, Lightbulb, BookOpen, Heart, MessageCircle, ThumbsUp, Clock } from 'lucide-react';

const DailyQuestionPage: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Mock data - in real app, this would come from API
  const questionData = {
    mathematics: {
      chapter: 'Differential Calculus',
      difficulty: 'Medium',
      attempted: 1247,
      solved: 892,
      question: 'If f(x) = x³ - 6x² + 9x + 1, then the number of critical points of f(x) is:',
      options: [
        { id: 'A', text: '0' },
        { id: 'B', text: '1' },
        { id: 'C', text: '2' },
        { id: 'D', text: '3' }
      ],
      correctAnswer: 'C',
      hint: 'Find f\'(x) and set it equal to zero to find critical points.',
      solution: 'f\'(x) = 3x² - 12x + 9\nSetting f\'(x) = 0:\n3x² - 12x + 9 = 0\nx² - 4x + 3 = 0\n(x - 1)(x - 3) = 0\nSo x = 1 and x = 3\nTherefore, there are 2 critical points.',
      likes: 234
    },
    physics: {
      chapter: 'Mechanics',
      difficulty: 'Hard',
      attempted: 956,
      solved: 543,
      question: 'A block of mass 2 kg is placed on a rough inclined plane of angle 30°. If the coefficient of friction is 0.5, what is the acceleration of the block?',
      options: [
        { id: 'A', text: '0.67 m/s²' },
        { id: 'B', text: '1.2 m/s²' },
        { id: 'C', text: '2.4 m/s²' },
        { id: 'D', text: '4.9 m/s²' }
      ],
      correctAnswer: 'A',
      hint: 'Consider forces parallel and perpendicular to the incline.',
      solution: 'Forces parallel to incline:\nmg sin θ - f = ma\nf = μN = μmg cos θ\nma = mg sin θ - μmg cos θ\na = g(sin θ - μ cos θ)\na = 9.8(sin 30° - 0.5 × cos 30°)\na = 9.8(0.5 - 0.5 × 0.866) = 0.67 m/s²',
      likes: 189
    },
    chemistry: {
      chapter: 'Organic Chemistry',
      difficulty: 'Easy',
      attempted: 1456,
      solved: 1203,
      question: 'Which of the following is the correct IUPAC name for CH₃-CH(CH₃)-CH₂-CH₃?',
      options: [
        { id: 'A', text: '2-methylbutane' },
        { id: 'B', text: '3-methylbutane' },
        { id: 'C', text: '2-methylpropane' },
        { id: 'D', text: 'isopentane' }
      ],
      correctAnswer: 'A',
      hint: 'Find the longest carbon chain and number from the end closest to the branch.',
      solution: 'The longest chain has 4 carbons (butane).\nNumbering from right: CH₃-CH(CH₃)-CH₂-CH₃\nThe methyl group is at position 2.\nTherefore: 2-methylbutane',
      likes: 156
    }
  };

  const currentQuestion = questionData[subject as keyof typeof questionData] || questionData.mathematics;
  const accuracy = Math.round((currentQuestion.solved / currentQuestion.attempted) * 100);

  const comments = [
    {
      id: 1,
      username: 'Rahul_JEE2025',
      timestamp: '2 hours ago',
      content: 'Great question! The hint really helped me understand the concept.',
      likes: 12,
      replies: [
        {
          id: 11,
          username: 'Priya_Math',
          timestamp: '1 hour ago',
          content: 'I agree! These daily questions are really helpful for practice.',
          likes: 5
        }
      ]
    },
    {
      id: 2,
      username: 'Arjun_Physics',
      timestamp: '4 hours ago',
      content: 'Can someone explain why option C is correct? I\'m getting confused with the calculation.',
      likes: 8,
      replies: []
    },
    {
      id: 3,
      username: 'Sneha_Chem',
      timestamp: '6 hours ago',
      content: 'This type of question frequently appears in JEE Main. Thanks for sharing!',
      likes: 15,
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
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Today's Question</h1>
            <p className="text-gray-600 mt-1">{subject?.charAt(0).toUpperCase() + subject?.slice(1)}</p>
          </div>
        </div>

        {/* Question Info Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">{currentQuestion.chapter}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
                {currentQuestion.difficulty}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                <span>{currentQuestion.likes + (isLiked ? 1 : 0)}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Users size={16} />
              <span>{currentQuestion.attempted} attempted</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Target size={16} />
              <span>{currentQuestion.solved} solved</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <ThumbsUp size={16} />
              <span>{accuracy}% accuracy</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock size={16} />
              <span>Daily Question</span>
            </div>
          </div>
        </div>

        {/* Main Question Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{currentQuestion.question}</h3>
          
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedOption === option.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  isSubmitted
                    ? option.id === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : selectedOption === option.id && option.id !== currentQuestion.correctAnswer
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
              selectedOption === currentQuestion.correctAnswer
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium ${
                selectedOption === currentQuestion.correctAnswer ? 'text-green-800' : 'text-red-800'
              }`}>
                {selectedOption === currentQuestion.correctAnswer
                  ? '🎉 Correct! Well done!'
                  : `❌ Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`
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
                <p className="text-gray-800">{currentQuestion.hint}</p>
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
                <pre className="text-gray-800 whitespace-pre-wrap font-sans">{currentQuestion.solution}</pre>
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
              placeholder="Share your thoughts or ask a question..."
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
                    
                    <p className="text-gray-800 mb-3">{comment.content}</p>
                    
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
                              
                              <p className="text-gray-800 text-sm mb-2">{reply.content}</p>
                              
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

export default DailyQuestionPage;