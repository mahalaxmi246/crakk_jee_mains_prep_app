import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Target, TrendingUp, Play } from 'lucide-react';

const ChapterListPage: React.FC = () => {
  const { subject, topic } = useParams<{ subject: string; topic: string }>();

  const topicData: Record<string, Record<string, any>> = {
    mathematics: {
      algebra: {
        name: 'Algebra',
        chapters: [
          { name: 'Linear Equations', problems: 25, accuracy: 78, progress: 85, difficulty: 'Easy' },
          { name: 'Quadratic Equations', problems: 30, accuracy: 65, progress: 70, difficulty: 'Medium' },
          { name: 'Sequences & Series', problems: 28, accuracy: 58, progress: 60, difficulty: 'Hard' },
          { name: 'Permutations & Combinations', problems: 22, accuracy: 72, progress: 80, difficulty: 'Medium' },
          { name: 'Binomial Theorem', problems: 18, accuracy: 68, progress: 75, difficulty: 'Medium' },
          { name: 'Complex Numbers', problems: 20, accuracy: 55, progress: 45, difficulty: 'Hard' },
          { name: 'Matrices & Determinants', problems: 24, accuracy: 62, progress: 65, difficulty: 'Hard' },
          { name: 'Mathematical Induction', problems: 15, accuracy: 70, progress: 85, difficulty: 'Medium' }
        ]
      },
      calculus: {
        name: 'Calculus',
        chapters: [
          { name: 'Limits & Continuity', problems: 20, accuracy: 72, progress: 80, difficulty: 'Medium' },
          { name: 'Differential Calculus', problems: 35, accuracy: 65, progress: 70, difficulty: 'Hard' },
          { name: 'Applications of Derivatives', problems: 28, accuracy: 58, progress: 55, difficulty: 'Hard' },
          { name: 'Integral Calculus', problems: 32, accuracy: 60, progress: 65, difficulty: 'Hard' },
          { name: 'Applications of Integrals', problems: 25, accuracy: 68, progress: 75, difficulty: 'Medium' },
          { name: 'Differential Equations', problems: 22, accuracy: 52, progress: 40, difficulty: 'Hard' }
        ]
      }
    },
    physics: {
      mechanics: {
        name: 'Mechanics',
        chapters: [
          { name: 'Kinematics', problems: 28, accuracy: 75, progress: 85, difficulty: 'Easy' },
          { name: 'Laws of Motion', problems: 32, accuracy: 68, progress: 80, difficulty: 'Medium' },
          { name: 'Work, Energy & Power', problems: 25, accuracy: 62, progress: 70, difficulty: 'Medium' },
          { name: 'Rotational Motion', problems: 30, accuracy: 55, progress: 60, difficulty: 'Hard' },
          { name: 'Gravitation', problems: 22, accuracy: 70, progress: 75, difficulty: 'Medium' },
          { name: 'Simple Harmonic Motion', problems: 20, accuracy: 58, progress: 65, difficulty: 'Hard' },
          { name: 'Fluid Mechanics', problems: 18, accuracy: 65, progress: 70, difficulty: 'Medium' }
        ]
      }
    },
    chemistry: {
      'organic-chemistry': {
        name: 'Organic Chemistry',
        chapters: [
          { name: 'Basic Principles', problems: 20, accuracy: 72, progress: 80, difficulty: 'Easy' },
          { name: 'Hydrocarbons', problems: 35, accuracy: 65, progress: 70, difficulty: 'Medium' },
          { name: 'Haloalkanes & Haloarenes', problems: 28, accuracy: 58, progress: 60, difficulty: 'Hard' },
          { name: 'Alcohols, Phenols & Ethers', problems: 25, accuracy: 68, progress: 75, difficulty: 'Medium' },
          { name: 'Aldehydes & Ketones', problems: 30, accuracy: 60, progress: 65, difficulty: 'Hard' },
          { name: 'Carboxylic Acids', problems: 22, accuracy: 70, progress: 80, difficulty: 'Medium' },
          { name: 'Amines', problems: 18, accuracy: 65, progress: 70, difficulty: 'Medium' },
          { name: 'Biomolecules', problems: 24, accuracy: 72, progress: 85, difficulty: 'Easy' }
        ]
      }
    }
  };

  const currentTopic = topicData[subject || '']?.[topic || ''] || topicData.mathematics.algebra;
  const subjectName = subject?.charAt(0).toUpperCase() + subject?.slice(1);
  const topicName = topic?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 bg-green-500';
    if (progress >= 60) return 'text-yellow-600 bg-yellow-500';
    return 'text-red-600 bg-red-500';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to={`/dpp/${subject}`}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{currentTopic.name} Chapters</h1>
            <p className="text-gray-600 mt-2">{subjectName} • {topicName}</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-purple-600 mb-2">{currentTopic.chapters.length}</div>
            <div className="text-gray-600">Chapters</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {currentTopic.chapters.reduce((sum: number, chapter: any) => sum + chapter.problems, 0)}
            </div>
            <div className="text-gray-600">Total Problems</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round(currentTopic.chapters.reduce((sum: number, chapter: any) => sum + chapter.progress, 0) / currentTopic.chapters.length)}%
            </div>
            <div className="text-gray-600">Avg Progress</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {Math.round(currentTopic.chapters.reduce((sum: number, chapter: any) => sum + chapter.accuracy, 0) / currentTopic.chapters.length)}%
            </div>
            <div className="text-gray-600">Avg Accuracy</div>
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {currentTopic.chapters.map((chapter: any, index: number) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{chapter.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Target size={16} />
                      <span>{chapter.problems} problems</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(chapter.difficulty)}`}>
                      {chapter.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className={`text-sm font-medium ${getProgressColor(chapter.progress).split(' ')[0]}`}>
                    {chapter.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(chapter.progress).split(' ')[1]}`}
                    style={{ width: `${chapter.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Accuracy */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Your Accuracy</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={16} className={getAccuracyColor(chapter.accuracy)} />
                    <span className={`text-sm font-medium ${getAccuracyColor(chapter.accuracy)}`}>
                      {chapter.accuracy}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={`/dpp/${subject}/${topic}/${chapter.name.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '').replace(/&/g, 'and')}`}
                className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium group"
              >
                <Play size={18} />
                <span>Start Practice</span>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Tips */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Study Tips for {currentTopic.name}</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📚 Preparation Strategy</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Start with easier chapters to build confidence</li>
                <li>• Focus on chapters with lower accuracy first</li>
                <li>• Practice regularly to maintain progress</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🎯 Performance Tips</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Review solutions for incorrect answers</li>
                <li>• Use hints when stuck on difficult problems</li>
                <li>• Participate in chapter discussions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterListPage;