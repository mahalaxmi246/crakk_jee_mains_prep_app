import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, HelpCircle, FileText, Calendar, ArrowRight } from 'lucide-react';

const ChatbotPreview: React.FC = () => {
  const chatbots = [
    {
      name: 'Questions Generator',
      description: 'Generate practice problems based on topics',
      icon: Bot,
      color: 'bg-purple-500',
      type: 'generator'
    },
    {
      name: 'Doubt Solver',
      description: 'Get instant solutions to your doubts',
      icon: HelpCircle,
      color: 'bg-blue-500',
      type: 'solver'
    },
    {
      name: 'Summarizer',
      description: 'Get concise summaries of chapters',
      icon: FileText,
      color: 'bg-green-500',
      type: 'summarizer'
    },
    {
      name: 'Study Planner',
      description: 'Create personalized study schedules',
      icon: Calendar,
      color: 'bg-orange-500',
      type: 'planner'
    }
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">AI Chatbots</h2>
          <p className="text-gray-600 mt-2">Powered by AI to boost your JEE preparation</p>
        </div>
        <Link
          to="/chatbots"
          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors font-medium"
        >
          <span>View All</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {chatbots.map((chatbot) => {
          const IconComponent = chatbot.icon;
          return (
            <Link
              key={chatbot.type}
              to={`/chatbots/${chatbot.type}`}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
            >
              <div className={`${chatbot.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white`}>
                <IconComponent size={24} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{chatbot.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{chatbot.description}</p>
              
              <div className="flex items-center text-purple-600 font-medium">
                <span>Try Now</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ChatbotPreview;