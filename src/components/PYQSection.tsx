import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

const PYQSection: React.FC = () => {
  const subjects = [
    { name: 'Mathematics', papers: 45, chapters: 25, color: 'border-blue-200 hover:border-blue-300' },
    { name: 'Physics', papers: 40, chapters: 22, color: 'border-green-200 hover:border-green-300' },
    { name: 'Chemistry', papers: 42, chapters: 28, color: 'border-orange-200 hover:border-orange-300' }
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Previous Year Questions (PYQs)</h2>
          <p className="text-gray-600 mt-2">Solve questions from JEE Main & Advanced (2015-2024)</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link
            key={subject.name}
            to={`/pyq/${subject.name.toLowerCase()}`}
            className={`bg-white rounded-xl p-6 border-2 ${subject.color} transition-all duration-300 group`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen size={24} className="text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">{subject.name}</h3>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Papers</span>
                <span className="font-medium text-gray-900">{subject.papers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Chapters</span>
                <span className="font-medium text-gray-900">{subject.chapters}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-purple-600 font-medium">Browse Chapters</span>
              <ArrowRight size={18} className="text-purple-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PYQSection;