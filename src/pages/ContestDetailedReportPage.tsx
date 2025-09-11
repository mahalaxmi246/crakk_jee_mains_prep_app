import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';

const ContestDetailedReportPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const location = useLocation();
  const { answers = {}, scores = {}, timeSpent = 0 } = location.state || {};
  
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'Physics' | 'Chemistry' | 'Mathematics'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');

  // Mock contest data with solutions
  const contestData = {
    id: contestId,
    name: 'JEE Mock Test #12',
    subjects: {
      Physics: { start: 1, end: 30 },
      Chemistry: { start: 31, end: 60 },
      Mathematics: { start: 61, end: 90 }
    }
  };

  // Mock questions with solutions
  const questions = Array.from({ length: 90 }, (_, i) => {
    const questionNumber = i + 1;
    const subject = i < 30 ? 'Physics' : i < 60 ? 'Chemistry' : 'Mathematics';
    const userAnswer = answers[questionNumber];
    const correctAnswer = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]; // Mock correct answer
    const isCorrect = userAnswer === correctAnswer;
    
    return {
      id: questionNumber,
      subject,
      question: `Sample question ${questionNumber} for ${subject}. This is a detailed question that tests understanding of key concepts in ${subject}.`,
      options: [
        { id: 'A', text: `Option A for question ${questionNumber}` },
        { id: 'B', text: `Option B for question ${questionNumber}` },
        { id: 'C', text: `Option C for question ${questionNumber}` },
        { id: 'D', text: `Option D for question ${questionNumber}` }
      ],
      correctAnswer,
      userAnswer,
      isCorrect,
      status: !userAnswer ? 'unattempted' : isCorrect ? 'correct' : 'incorrect',
      solution: `This is the detailed solution for question ${questionNumber}. The correct approach involves understanding the fundamental principles of ${subject} and applying them systematically. The correct answer is ${correctAnswer} because...`,
      explanation: `Key concept: This question tests your understanding of ${subject} fundamentals. Remember to always consider the given conditions and apply the appropriate formulas.`
    };
  });

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const subjectMatch = selectedSubject === 'all' || q.subject === selectedSubject;
    const statusMatch = selectedStatus === 'all' || q.status === selectedStatus;
    return subjectMatch && statusMatch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'incorrect':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <Eye size={20} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct':
        return 'border-green-200 bg-green-50';
      case 'incorrect':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getOptionStyle = (question: any, optionId: string) => {
    if (optionId === question.correctAnswer && optionId === question.userAnswer) {
      return 'border-green-500 bg-green-100 text-green-800'; // Correct answer selected
    } else if (optionId === question.correctAnswer) {
      return 'border-green-500 bg-green-100 text-green-800'; // Correct answer
    } else if (optionId === question.userAnswer) {
      return 'border-red-500 bg-red-100 text-red-800'; // Wrong answer selected
    }
    return 'border-gray-200 bg-white text-gray-700'; // Not selected
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to={`/contests/${contestId}/summary`}
            state={{ answers, scores, timeSpent }}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detailed Report</h1>
            <p className="text-gray-600 mt-1">{contestData.name}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <Filter size={20} className="text-gray-600" />
              <span className="font-medium text-gray-900">Filters:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Subjects</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Questions</option>
                  <option value="correct">Correct</option>
                  <option value="incorrect">Incorrect</option>
                  <option value="unattempted">Unattempted</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredQuestions.length} of {questions.length} questions
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.map((question) => (
            <div key={question.id} className={`bg-white rounded-xl p-6 shadow-sm border-2 ${getStatusColor(question.status)}`}>
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(question.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Question {question.id}
                    </h3>
                    <p className="text-sm text-gray-600">{question.subject}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    question.status === 'correct' ? 'bg-green-100 text-green-700' :
                    question.status === 'incorrect' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {question.status === 'correct' ? 'Correct' :
                     question.status === 'incorrect' ? 'Incorrect' :
                     'Not Attempted'}
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-gray-900 leading-relaxed">{question.question}</p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 ${getOptionStyle(question, option.id)}`}
                  >
                    <span className="font-medium">{option.id}.</span>
                    <span>{option.text}</span>
                    {option.id === question.correctAnswer && (
                      <CheckCircle size={16} className="text-green-600 ml-auto" />
                    )}
                    {option.id === question.userAnswer && option.id !== question.correctAnswer && (
                      <XCircle size={16} className="text-red-600 ml-auto" />
                    )}
                  </div>
                ))}
              </div>

              {/* Answer Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Your Answer: </span>
                    <span className={question.userAnswer ? 
                      (question.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium') : 
                      'text-gray-500'
                    }>
                      {question.userAnswer || 'Not Attempted'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Correct Answer: </span>
                    <span className="text-green-600 font-medium">{question.correctAnswer}</span>
                  </div>
                </div>
              </div>

              {/* Solution */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BookOpen size={20} className="text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Solution</h4>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                  <p className="text-gray-800 leading-relaxed">{question.solution}</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <strong>💡 Key Insight:</strong> {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more questions.</p>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            to={`/contests/${contestId}/summary`}
            state={{ answers, scores, timeSpent }}
            className="inline-flex items-center space-x-2 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            <span>Back to Summary</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContestDetailedReportPage;