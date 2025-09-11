import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  Loader, 
  Plus, 
  Search, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  BookOpen, 
  Save,
  ChevronDown,
  MessageSquare,
  StickyNote,
  Upload
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: Date;
  saved?: boolean;
}

interface Chat {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: Message[];
}

interface SavedNote {
  id: string;
  title: string;
  content: string;
  chatId: string;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatbot, setSelectedChatbot] = useState(type || 'generator');
  const [currentChatId, setCurrentChatId] = useState('chat-1');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 'chat-1',
      title: 'Calculus Problems',
      preview: 'Generate some integration problems...',
      timestamp: new Date('2024-12-25T10:30:00'),
      messages: []
    },
    {
      id: 'chat-2',
      title: 'Physics Doubts',
      preview: 'Explain Newton\'s laws...',
      timestamp: new Date('2024-12-24T15:45:00'),
      messages: []
    },
    {
      id: 'chat-3',
      title: 'Chemistry Summary',
      preview: 'Summarize organic chemistry...',
      timestamp: new Date('2024-12-23T09:15:00'),
      messages: []
    }
  ]);

  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([
    {
      id: 'note-1',
      title: 'Integration by Parts Formula',
      content: '∫u dv = uv - ∫v du\nThis is the fundamental formula for integration by parts...',
      chatId: 'chat-1',
      timestamp: new Date('2024-12-25T10:35:00')
    },
    {
      id: 'note-2',
      title: 'Newton\'s Second Law',
      content: 'F = ma\nForce equals mass times acceleration. This is one of the most important laws in physics...',
      chatId: 'chat-2',
      timestamp: new Date('2024-12-24T15:50:00')
    }
  ]);

  const chatbotInfo: Record<string, { name: string; placeholder: string; welcomeMessage: string; icon: string }> = {
    generator: {
      name: 'Questions Generator',
      placeholder: 'e.g., "Generate 5 calculus problems on integration"',
      welcomeMessage: 'Hello! I can generate practice problems for any topic. Just tell me what subject and topic you\'d like to practice!',
      icon: '🎯'
    },
    solver: {
      name: 'Doubt Solver',
      placeholder: 'Describe your doubt or upload an image...',
      welcomeMessage: 'Hi! I\'m here to help solve your doubts. Describe your problem or question, and I\'ll provide a detailed explanation.',
      icon: '🤔'
    },
    summarizer: {
      name: 'Summarizer',
      placeholder: 'e.g., "Summarize the chapter on Thermodynamics"',
      welcomeMessage: 'Welcome! I can create concise summaries of any chapter or topic. What would you like me to summarize?',
      icon: '📝'
    },
    planner: {
      name: 'Study Planner',
      placeholder: 'e.g., "Plan my JEE preparation for next 6 months"',
      welcomeMessage: 'Hello! I\'ll help you create a personalized study plan. Tell me about your exam timeline and current preparation level.',
      icon: '📅'
    }
  };

  const currentBot = chatbotInfo[selectedChatbot] || chatbotInfo.generator;

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        sender: 'bot',
        content: currentBot.welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [selectedChatbot, currentBot.welcomeMessage, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      let botResponse = '';
      
      switch (selectedChatbot) {
        case 'generator':
          botResponse = `Here are some practice problems for you:\n\n**Problem 1:** If f(x) = x² + 3x - 2, find f'(x)\n\n**Problem 2:** Solve the integral ∫(2x + 1)dx\n\n**Problem 3:** Find the limit of (x² - 4)/(x - 2) as x approaches 2\n\nWould you like solutions for these problems or need more questions on a specific topic?`;
          break;
        case 'solver':
          botResponse = `I'd be happy to help solve this problem! Here's a step-by-step approach:\n\n**Step 1:** Identify what we know and what we need to find\n**Step 2:** Choose the appropriate formula or method\n**Step 3:** Substitute the values and solve\n**Step 4:** Verify the answer\n\nCould you provide more details about the specific problem you're working on?`;
          break;
        case 'summarizer':
          botResponse = `## Chapter Summary\n\n**Key Concepts:**\n• Important theorem or law\n• Core principles and applications\n• Common formulas and equations\n\n**Important Points:**\n• Main topics covered in this chapter\n• Typical problem-solving approaches\n• Common mistakes to avoid\n\n**Quick Revision:**\n• Essential formulas to remember\n• Practice problem types\n\nWould you like me to elaborate on any specific topic?`;
          break;
        case 'planner':
          botResponse = `Based on your requirements, here's a suggested study plan:\n\n**Phase 1 (Weeks 1-8):** Foundation Building\n• Complete NCERT thoroughly\n• Practice basic problems\n\n**Phase 2 (Weeks 9-16):** Concept Strengthening\n• Advanced problem solving\n• Previous year questions\n\n**Phase 3 (Weeks 17-24):** Test & Revision\n• Mock tests and analysis\n• Weak area improvement\n\nWould you like me to create a more detailed schedule for any specific phase?`;
          break;
        default:
          botResponse = 'I\'m here to help! Please let me know what you\'d like assistance with.';
      }

      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newBotMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      title: 'New Chat',
      preview: 'New conversation...',
      timestamp: new Date(),
      messages: []
    };
    
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
  };

  const handleSaveNote = (message: Message) => {
    const newNote: SavedNote = {
      id: `note-${Date.now()}`,
      title: message.content.substring(0, 50) + '...',
      content: message.content,
      chatId: currentChatId,
      timestamp: new Date()
    };
    
    setSavedNotes(prev => [newNote, ...prev]);
    
    // Mark message as saved
    setMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, saved: true } : msg
    ));
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Left Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col h-screen`}>
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
          >
            <Plus size={20} />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Search Chats */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="relative">
            <Search size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
            />
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <MessageSquare size={16} className="inline mr-2" />
              Recent Chats
            </h3>
            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setCurrentChatId(chat.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentChatId === chat.id
                      ? isDarkMode ? 'bg-gray-700' : 'bg-purple-50 border border-purple-200'
                      : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`font-medium text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {chat.title}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                    {chat.preview}
                  </div>
                  <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formatTime(chat.timestamp)}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Chat Header */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                  {currentBot.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentBot.name}
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Online</p>
                </div>
              </div>
            </div>

            {/* Chatbot Selector */}
            <div className="relative flex-shrink-0">
              <select
                value={selectedChatbot}
                onChange={(e) => setSelectedChatbot(e.target.value)}
                className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="generator">Questions Generator</option>
                <option value="solver">Doubt Solver</option>
                <option value="summarizer">Summarizer</option>
                <option value="planner">Study Planner</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-6 min-h-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'bot' && (
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm">
                  {currentBot.icon}
                </div>
              )}
              
              <div className="group relative">
                <div
                  className={`max-w-3xl px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : isDarkMode ? 'bg-gray-700 text-white' : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-line">{message.content}</div>
                  <div
                    className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-purple-200' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {/* Save Note Button */}
                {message.sender === 'bot' && (
                  <button
                    onClick={() => handleSaveNote(message)}
                    className={`absolute -right-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                      message.saved 
                        ? 'text-green-600' 
                        : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title={message.saved ? 'Saved' : 'Save note'}
                  >
                    <Save size={16} />
                  </button>
                )}
              </div>
              
              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm">
                {currentBot.icon}
              </div>
              <div className={`px-4 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  <Loader size={16} className="animate-spin text-purple-600" />
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t flex-shrink-0 sticky bottom-0`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className={`flex-1 px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                <Upload size={18} />
              </button>
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;