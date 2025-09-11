import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Trophy, Clock, Target, BookOpen, ArrowLeft } from 'lucide-react';

const ContestSummaryPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const location = useLocation();
  const { answers = {}, timeSpent = 0 } = location.state || {};

  // Mock contest data
  const contestData = {
    id: contestId,
    name: 'JEE Mock Test #12',
    totalQuestions: 90,
    totalMarks: 300,
    subjects: {
      Physics: { start: 1, end: 30, maxMarks: 100 },
      Chemistry: { start: 31, end: 60, maxMarks: 100 },
      Mathematics: { start: 61, end: 90, maxMarks: 100 }
    }
  };

  // Calculate scores (mock calculation)
  const calculateScores = () => {
    const scores = {
      Physics: 0,
      Chemistry: 0,
      Mathematics: 0,
      total: 0
    };

    // Mock scoring - in real app, this would be based on correct answers
    Object.entries(contestData.subjects).forEach(([subject, range]) => {
      let subjectScore = 0;
      for (let i = range.start; i <= range.end; i++) {
        if (answers[i]) {
          // Mock: 70% chance of correct answer
          subjectScore += Math.random() > 0.3 ? 4 : -1; // +4 for correct, -1 for wrong
        }
      }
      scores[subject as keyof typeof scores] = Math.max(0, Math.min(subjectScore, range.maxMarks));
    });

    scores.total = scores.Physics + scores.Chemistry + scores.Mathematics;
    return scores;
  };

  const scores = calculateScores();
  const totalAnswered = Object.keys(answers).length;
  const percentage = Math.round((scores.total / contestData.totalMarks) * 100);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getSubjectStats = () => {
    const stats: Record<string, { attempted: number; total: number }> = {};
    Object.entries(contestData.subjects).forEach(([subject, range]) => {
      let attempted = 0;
      for (let i = range.start; i <= range.end; i++) {
        if (answers[i]) attempted++;
      }
      stats[subject] = {
        attempted,
        total: range.end - range.start + 1
      };
    });
    return stats;
  };

  const subjectStats = getSubjectStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/contests"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Completed!</h1>
            <p className="text-gray-600 mt-1">{contestData.name}</p>
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Trophy size={32} />
              <h2 className="text-2xl font-bold">Your Score</h2>
            </div>
            <div className="text-6xl font-bold mb-2">{scores.total}</div>
            <div className="text-xl opacity-90 mb-4">out of {contestData.totalMarks} marks</div>
            <div className="text-lg opacity-80">{percentage}% Score</div>
          </div>
        </div>

        {/* Subject-wise Scores */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(contestData.subjects).map(([subject, range]) => {
            const subjectScore = scores[subject as keyof typeof scores];
            const subjectPercentage = Math.round((subjectScore / range.maxMarks) * 100);
            
            return (
              <div key={subject} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{subject}</h3>
                
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{subjectScore}</div>
                  <div className="text-gray-600">out of {range.maxMarks}</div>
                  <div className="text-sm text-gray-500">{subjectPercentage}%</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attempted:</span>
                    <span className="font-medium">{subjectStats[subject].attempted}/{subjectStats[subject].total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium">{range.start}-{range.end}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${subjectPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Test Statistics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Statistics</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Target size={20} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Questions Attempted</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalAnswered}</div>
              <div className="text-sm text-gray-500">out of {contestData.totalQuestions}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock size={20} className="text-green-600" />
                <span className="text-sm font-medium text-gray-600">Time Spent</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatTime(timeSpent)}</div>
              <div className="text-sm text-gray-500">out of 3h 0m 0s</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Trophy size={20} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <BookOpen size={20} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Completion</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round((totalAnswered / contestData.totalQuestions) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Questions Done</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/contests/${contestId}/detailed-report`}
            state={{ answers, scores, timeSpent }}
            className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <BookOpen size={20} />
            <span>View Detailed Report</span>
          </Link>
          
          <Link
            to="/contests"
            className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <span>Back to Contests</span>
          </Link>
        </div>

        {/* Performance Message */}
        <div className="mt-8 text-center">
          <div className={`inline-block px-6 py-3 rounded-lg ${
            percentage >= 80 ? 'bg-green-100 text-green-800' :
            percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {percentage >= 80 ? '🎉 Excellent Performance!' :
             percentage >= 60 ? '👍 Good Job!' :
             '💪 Keep Practicing!'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestSummaryPage;