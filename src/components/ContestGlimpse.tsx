import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Users, ArrowRight } from 'lucide-react';

const ContestGlimpse: React.FC = () => {
  const upcomingContests = [
    {
      name: 'Weekly Math Challenge',
      subject: 'Mathematics',
      date: '2024-12-28',
      time: '3:00 PM',
      participants: 1250,
      duration: '2 hours',
      prize: '₹5,000'
    },
    {
      name: 'Physics Quiz Championship',
      subject: 'Physics',
      date: '2024-12-30',
      time: '4:00 PM',
      participants: 980,
      duration: '1.5 hours',
      prize: '₹3,000'
    }
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Upcoming Contests</h2>
          <p className="text-gray-600 mt-2">Compete with students across India</p>
        </div>
        <Link
          to="/contests"
          className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <span>View All Contests</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {upcomingContests.map((contest, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{contest.name}</h3>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {contest.subject}
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-orange-600 font-semibold">
                  <Trophy size={16} />
                  <span>{contest.prize}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock size={16} />
                <span>{contest.date} at {contest.time}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users size={16} />
                <span>{contest.participants} registered</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600">Duration: {contest.duration}</span>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Register Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContestGlimpse;