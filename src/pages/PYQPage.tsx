import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Target, Search, Filter } from 'lucide-react';

const PYQPage: React.FC = () => {
  const { subject } = useParams<{ subject: string }>();
  const [selectedExam, setSelectedExam] = useState<'all' | 'mains' | 'advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const subjectData: Record<string, any> = {
    mathematics: {
      name: 'Mathematics',
      color: 'blue',
      chapters: [
        { 
          name: 'Differential Calculus', 
          totalQuestions: 45, 
          mainsQuestions: 28, 
          advancedQuestions: 17,
          description: 'Limits, continuity, derivatives and applications'
        },
        { 
          name: 'Integral Calculus', 
          totalQuestions: 38, 
          mainsQuestions: 24, 
          advancedQuestions: 14,
          description: 'Integration techniques and applications'
        },
        { 
          name: 'Coordinate Geometry', 
          totalQuestions: 42, 
          mainsQuestions: 26, 
          advancedQuestions: 16,
          description: 'Straight lines, circles, conic sections'
        },
        { 
          name: 'Algebra', 
          totalQuestions: 35, 
          mainsQuestions: 22, 
          advancedQuestions: 13,
          description: 'Quadratic equations, sequences, series'
        },
        { 
          name: 'Trigonometry', 
          totalQuestions: 28, 
          mainsQuestions: 18, 
          advancedQuestions: 10,
          description: 'Trigonometric functions and identities'
        },
        { 
          name: 'Complex Numbers', 
          totalQuestions: 22, 
          mainsQuestions: 14, 
          advancedQuestions: 8,
          description: 'Complex plane, roots, equations'
        },
        { 
          name: 'Probability', 
          totalQuestions: 25, 
          mainsQuestions: 16, 
          advancedQuestions: 9,
          description: 'Probability distributions and statistics'
        },
        { 
          name: 'Matrices & Determinants', 
          totalQuestions: 20, 
          mainsQuestions: 12, 
          advancedQuestions: 8,
          description: 'Matrix operations and determinant properties'
        }
      ]
    },
    physics: {
      name: 'Physics',
      color: 'green',
      chapters: [
        { 
          name: 'Mechanics', 
          totalQuestions: 52, 
          mainsQuestions: 32, 
          advancedQuestions: 20,
          description: 'Kinematics, dynamics, work-energy theorem'
        },
        { 
          name: 'Thermodynamics', 
          totalQuestions: 28, 
          mainsQuestions: 18, 
          advancedQuestions: 10,
          description: 'Laws of thermodynamics, heat engines'
        },
        { 
          name: 'Optics', 
          totalQuestions: 35, 
          mainsQuestions: 22, 
          advancedQuestions: 13,
          description: 'Ray optics, wave optics, optical instruments'
        },
        { 
          name: 'Electromagnetism', 
          totalQuestions: 48, 
          mainsQuestions: 30, 
          advancedQuestions: 18,
          description: 'Electric and magnetic fields, induction'
        },
        { 
          name: 'Modern Physics', 
          totalQuestions: 32, 
          mainsQuestions: 20, 
          advancedQuestions: 12,
          description: 'Atomic structure, nuclear physics'
        },
        { 
          name: 'Waves & Oscillations', 
          totalQuestions: 25, 
          mainsQuestions: 16, 
          advancedQuestions: 9,
          description: 'Simple harmonic motion, wave motion'
        },
        { 
          name: 'Rotational Motion', 
          totalQuestions: 22, 
          mainsQuestions: 14, 
          advancedQuestions: 8,
          description: 'Angular motion, moment of inertia'
        }
      ]
    },
    chemistry: {
      name: 'Chemistry',
      color: 'orange',
      chapters: [
        { 
          name: 'Organic Chemistry', 
          totalQuestions: 58, 
          mainsQuestions: 36, 
          advancedQuestions: 22,
          description: 'Hydrocarbons, functional groups, reactions'
        },
        { 
          name: 'Inorganic Chemistry', 
          totalQuestions: 45, 
          mainsQuestions: 28, 
          advancedQuestions: 17,
          description: 'Periodic table, coordination compounds'
        },
        { 
          name: 'Physical Chemistry', 
          totalQuestions: 40, 
          mainsQuestions: 25, 
          advancedQuestions: 15,
          description: 'Chemical kinetics, equilibrium, thermodynamics'
        },
        { 
          name: 'Chemical Bonding', 
          totalQuestions: 28, 
          mainsQuestions: 18, 
          advancedQuestions: 10,
          description: 'Ionic, covalent, metallic bonding'
        },
        { 
          name: 'Equilibrium', 
          totalQuestions: 25, 
          mainsQuestions: 16, 
          advancedQuestions: 9,
          description: 'Chemical and ionic equilibrium'
        },
        { 
          name: 'Electrochemistry', 
          totalQuestions: 22, 
          mainsQuestions: 14, 
          advancedQuestions: 8,
          description: 'Galvanic cells, electrolysis'
        },
        { 
          name: 'Atomic Structure', 
          totalQuestions: 20, 
          mainsQuestions: 12, 
          advancedQuestions: 8,
          description: 'Quantum numbers, electronic configuration'
        }
      ]
    }
  };

  const currentSubject = subjectData[subject || ''] || subjectData.mathematics;

  const filteredChapters = currentSubject.chapters.filter((chapter: any) => {
    const searchMatch = chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       chapter.description.toLowerCase().includes(searchQuery.toLowerCase());
    return searchMatch;
  });

  const getQuestionsCount = (chapter: any) => {
    if (selectedExam === 'mains') return chapter.mainsQuestions;
    if (selectedExam === 'advanced') return chapter.advancedQuestions;
    return chapter.totalQuestions;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{currentSubject.name} PYQs</h1>
            <p className="text-gray-600 mt-2">Previous Year Questions from JEE Main & Advanced (2015-2024)</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Exam Filter */}
              <div className="flex items-center space-x-3">
                <Filter size={20} className="text-gray-600" />
                <span className="font-medium text-gray-900">Exam:</span>
                <div className="flex space-x-2">
                  {['all', 'mains', 'advanced'].map((exam) => (
                    <button
                      key={exam}
                      onClick={() => setSelectedExam(exam as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedExam === exam
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {exam === 'all' ? 'All' : exam === 'mains' ? 'JEE Main' : 'JEE Advanced'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Filter */}
              <div className="flex items-center space-x-3">
                <Search size={20} className="text-gray-600" />
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredChapters.length} chapter{filteredChapters.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredChapters.map((chapter: any, index: number) => {
            const questionsCount = getQuestionsCount(chapter);
            
            return (
              <Link
                key={index}
                to={`/pyq/${subject}/${chapter.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}`}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{chapter.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{chapter.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Target size={16} />
                        <span>{questionsCount} questions</span>
                      </div>
                      {selectedExam === 'all' && (
                        <>
                          <span className="text-blue-600">{chapter.mainsQuestions} Main</span>
                          <span className="text-purple-600">{chapter.advancedQuestions} Advanced</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-purple-600 font-medium group-hover:text-purple-700">
                    View Questions
                  </span>
                  <div className="text-2xl font-bold text-gray-900">
                    {questionsCount}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredChapters.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No chapters found</h3>
            <p className="text-gray-600">Try adjusting your search to see more options.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PYQPage;