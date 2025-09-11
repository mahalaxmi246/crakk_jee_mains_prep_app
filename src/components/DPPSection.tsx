import React from 'react';
import { Link } from 'react-router-dom';
import { Calculator, Atom, FlaskConical, ArrowRight, Target } from 'lucide-react';

const DPPSection: React.FC = () => {
  const subjects = [
    {
      name: 'Mathematics',
      icon: Calculator,
      color: 'bg-blue-500',
      problems: 150,
      topics: ['Algebra', 'Calculus', 'Coordinate Geometry', 'Trigonometry']
    },
    {
      name: 'Physics',
      icon: Atom,
      color: 'bg-green-500',
      problems: 120,
      topics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism']
    },
    {
      name: 'Chemistry',
      icon: FlaskConical,
      color: 'bg-orange-500',
      problems: 135,
      topics: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry']
    }
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Daily Practice Problems (DPPs)</h2>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const IconComponent = subject.icon;
          return (
            <div
              key={subject.name}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`${subject.color} p-3 rounded-lg text-white`}>
                  <IconComponent size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{subject.name}</h3>
                  <p className="text-sm text-gray-600">{subject.problems} problems available</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Topics Covered:</p>
                <div className="flex flex-wrap gap-2">
                  {subject.topics.map((topic, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <Link
                  to={`/dpp/${subject.name.toLowerCase()}`}
                  className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium group"
                >
                  <span>Start Practice</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to={`/daily-question/${subject.name.toLowerCase()}`}
                  className="w-full flex items-center justify-center space-x-2 border border-purple-600 text-purple-600 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors font-medium group"
                >
                  <Target size={18} />
                  <span>Solve Today's Problem</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DPPSection;