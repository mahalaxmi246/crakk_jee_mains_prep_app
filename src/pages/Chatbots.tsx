import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, HelpCircle, FileText, Calendar, ArrowRight, Sparkles } from 'lucide-react';

const Chatbots: React.FC = () => {
  const chatbots = [
    {
      name: 'Questions Generator',
      description: 'Generate practice problems by topic/chapter.',
      icon: Bot,
      color: 'bg-purple-500',
      type: 'generator',
      features: ['Custom difficulty levels', 'Topic-wise questions', 'Step-by-step solutions']
    },
    {
      name: 'Doubt Solver',
      description: 'Ask doubts; get step-by-step help.',
      icon: HelpCircle,
      color: 'bg-blue-500',
      type: 'doubts',
      features: ['Image recognition', 'Detailed explanations', '24/7 availability']
    },
    {
      name: 'Summarizer',
      description: 'Summarize any chapter into crisp notes.',
      icon: FileText,
      color: 'bg-green-500',
      type: 'summarizer',
      features: ['Key points extraction', 'Formula highlights', 'Quick revision notes']
    },
    {
      name: 'Study Planner',
      description: 'Create a study plan for JEE.',
      icon: Calendar,
      color: 'bg-orange-500',
      type: 'planner',
      features: ['Personalized schedules', 'Progress tracking', 'Adaptive planning']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles size={32} className="text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI-Powered Study Assistants</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leverage the power of artificial intelligence to accelerate your JEE preparation. 
            Each chatbot is specially designed to address specific learning needs.
          </p>
        </div>

        {/* Chatbots Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {chatbots.map((chatbot) => {
            const IconComponent = chatbot.icon;
            return (
              <Link
                key={chatbot.type}
                to={`/chatbots/${chatbot.type}`}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-6">
                  <div className={`${chatbot.color} w-16 h-16 rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                    <IconComponent size={32} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{chatbot.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{chatbot.description}</p>
                    
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {chatbot.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className={`inline-flex items-center space-x-2 ${chatbot.color} text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-300 font-medium group-hover:translate-x-1`}>
                      <span>Start Chatting</span>
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to revolutionize your study experience?</h2>
          <p className="text-lg opacity-90 mb-6">
            Choose any AI assistant above and start your personalized learning journey today.
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm opacity-80">
            <span>✓ Free to use</span>
            <span>✓ No time limits</span>
            <span>✓ Unlimited questions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbots;