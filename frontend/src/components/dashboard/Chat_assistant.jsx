import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, MinusCircle, Loader, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AIMentor = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content:
        "Hi! I'm your AI Mentor. I can help you explore career paths, find learning resources, prepare for interviews, or connect with mentors. What would you like guidance on today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages when new message added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input field when chat is opened
  useEffect(() => {
    if (open && !minimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, minimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Detailed responses for career paths
  const careerResponses = {
    "software development":
      "Software Development is an excellent career path! You could focus on:\n\n• Frontend Development (creating user interfaces)\n• Backend Development (building server-side logic)\n• Mobile Development (iOS/Android apps)\n• Game Development\n• Full-Stack Development (both frontend and backend)\n\nTo get started, I recommend learning HTML, CSS, and JavaScript. Would you like more specific resources for any of these areas?",
    "data science":
      "Data Science combines statistics, programming, and domain expertise. Career options include:\n\n• Data Scientist (analyzing complex data)\n• Data Analyst (interpreting trends and creating visualizations)\n• Machine Learning Engineer (building AI systems)\n• Data Engineer (creating data pipelines)\n\nStart by learning Python and statistics fundamentals. Would you like me to recommend some beginner-friendly courses?",
    "ux design":
      "UX Design is a fantastic creative and technical field! As a UX Designer, you would:\n\n• Research user needs and behaviors\n• Create wireframes and prototypes\n• Design user interfaces\n• Conduct usability testing\n• Collaborate with developers\n\nPopular tools include Figma, Adobe XD, and Sketch. Many UX designers start with a design fundamentals course and build a portfolio of projects. Would you like specific resource recommendations to start learning UX design?",
    cybersecurity:
      "Cybersecurity offers many career paths:\n\n• Security Analyst (monitoring systems for threats)\n• Penetration Tester (ethically hacking systems)\n• Security Engineer (building secure systems)\n• Security Consultant (advising on security practices)\n\nYou can start by learning networking fundamentals and basic security concepts. Would you like me to suggest specific certifications or learning resources?",
    "product management":
      "Product Management involves overseeing product development from conception to launch. You would:\n\n• Define product vision and strategy\n• Work with engineers, designers, and stakeholders\n• Prioritize features based on user needs and business goals\n• Analyze product performance metrics\n\nMany product managers have backgrounds in business, design, or engineering. Would you like tips on transitioning into this role?",
    "web development":
      "Web Development can be divided into:\n\n• Frontend (HTML, CSS, JavaScript, frameworks like React)\n• Backend (server-side with Node.js, Python, Ruby, etc.)\n• Full-Stack (both frontend and backend)\n\nPopular frameworks include React, Angular, Vue.js, Node.js, and Django. Would you like a roadmap for becoming a web developer?",
  };

  // Learning resources by topic
  const learningResources = {
    programming:
      "For programming, I recommend:\n\n• freeCodeCamp - Free, comprehensive web development curriculum\n• The Odin Project - Full-stack curriculum with projects\n• Codecademy - Interactive coding lessons\n• LeetCode - For practicing coding interviews\n\nWhat specific programming language or framework are you interested in?",
    "ux design":
      "For UX Design, check out these resources:\n\n• Google's UX Design Certificate on Coursera\n• Nielsen Norman Group articles and courses\n• Interaction Design Foundation membership\n• \"Don't Make Me Think\" by Steve Krug (book)\n• Figma tutorials on YouTube\n\nWould you like me to suggest some beginner UX design projects to build your portfolio?",
    "data science":
      "For learning Data Science:\n\n• DataCamp - Interactive courses\n• Kaggle - Competitions and datasets to practice with\n• \"Python for Data Analysis\" by Wes McKinney\n• Fast.ai - Practical Deep Learning courses\n• StatQuest YouTube channel for statistics concepts\n\nWould you like resources focused on beginner, intermediate, or advanced topics?",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { type: 'user', content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Attempt to fetch response from API
      const response = await fetch('http://localhost:5000/student/api/tech-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          context: currentContext,
          history: messages.map((msg) => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from tech mentor');
      }

      const data = await response.json();

      if (data.success && data.data && data.data.response) {
        // Add API response to messages
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              type: 'bot',
              content: data.data.response,
              timestamp: new Date(),
            },
          ]);
          setCurrentContext(data.data.context || currentContext); // Update context if provided
          setLoading(false);
        }, 1000);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error("Couldn't connect to AI Mentor");

      // Fallback to hardcoded response logic
      const userQuery = userMessage.content.toLowerCase();
      let botReply = '';
      let newContext = currentContext;

      if (currentContext === 'career_guidance') {
        const mentionedCareer = Object.keys(careerResponses).find((career) =>
          userQuery.includes(career)
        );

        if (mentionedCareer) {
          botReply = careerResponses[mentionedCareer];
          newContext = 'career_details';
        } else if (
          userQuery.includes('which') ||
          userQuery.includes('what') ||
          userQuery.includes('how to') ||
          userQuery.includes('start') ||
          userQuery.includes('best') ||
          userQuery.includes('recommend')
        ) {
          botReply =
            'I can give you details about software development, data science, UX design, cybersecurity, product management, or web development. Which of these interests you most?';
        } else {
          botReply =
            'I’d be happy to discuss specific career paths in tech! I can provide details about software development, data science, UX design, cybersecurity, product management, or web development. Which would you like to explore?';
        }
      } else if (currentContext === 'learning_resources') {
        const topic = Object.keys(learningResources).find((t) => userQuery.includes(t));
        if (topic) {
          botReply = learningResources[topic];
        } else {
          botReply =
            'I can recommend learning resources for programming, UX design, data science, and more. What topic are you interested in learning about?';
        }
      } else {
        if (
          userQuery.includes('career') ||
          userQuery.includes('job') ||
          userQuery.includes('profession') ||
          userQuery.includes('work')
        ) {
          botReply =
            'I’d be happy to discuss career paths in tech! Based on current industry demand, you might consider exploring:\n\n• Software Development\n• Data Science\n• UX Design\n• Cybersecurity\n• Product Management\n• Web Development\n\nWhich of these sounds most interesting to you?';
          newContext = 'career_guidance';
        } else {
          const mentionedCareer = Object.keys(careerResponses).find((career) =>
            userQuery.includes(career)
          );

          if (mentionedCareer) {
            botReply = careerResponses[mentionedCareer];
            newContext = 'career_details';
          } else if (
            userQuery.includes('learn') ||
            userQuery.includes('course') ||
            userQuery.includes('study') ||
            userQuery.includes('resource') ||
            userQuery.includes('tutorial')
          ) {
            botReply =
              'I can recommend learning resources for various topics. What subject are you interested in learning about? For example: programming, UX design, data science, etc.';
            newContext = 'learning_resources';
          } else if (
            userQuery.includes('internship') ||
            userQuery.includes('job') ||
            userQuery.includes('apply') ||
            userQuery.includes('application') ||
            userQuery.includes('opportunity')
          ) {
            botReply =
              'Looking for opportunities? Here are some tips:\n\n• Update your profile with relevant skills and experiences\n• Check the Opportunities section in EduSpark regularly\n• Tailor your application for each position\n• Prepare a strong resume highlighting projects\n• Practice interview questions related to your field\n\nYou can browse current opportunities right now in the Opportunities section!';
            newContext = 'internship_advice';
          } else if (
            userQuery.includes('mentor') ||
            userQuery.includes('guidance') ||
            userQuery.includes('advice') ||
            userQuery.includes('expert') ||
            userQuery.includes('coach')
          ) {
            botReply =
              'Finding the right mentor can significantly impact your career journey! On EduSpark, you can:\n\n• Browse mentors by expertise, industry, and availability\n• Use the mentor matching system based on your skills and goals\n• Reach out with specific questions or goals\n• Schedule sessions via the platform\n\nWhat type of mentorship are you looking for?';
            newContext = 'mentor_finding';
          } else if (
            userQuery.includes('interview') ||
            userQuery.includes('recruit') ||
            userQuery.includes('hire') ||
            userQuery.includes('resume') ||
            userQuery.includes('cv')
          ) {
            botReply =
              'For interview preparation, I recommend:\n\n1. Research the company thoroughly\n2. Practice common questions for your field\n3. Prepare concrete examples of your work/projects\n4. Prepare questions to ask the interviewer\n5. Set up a mock interview with a mentor\n\nWhat type of role are you interviewing for?';
            newContext = 'interview_prep';
          } else {
            botReply =
              "I'm here to help with your educational and career journey! You can ask me about:\n\n• Career paths and opportunities\n• Learning resources and courses\n• Internship and job applications\n• Finding mentors\n• Interview preparation\n\nWhat would you like guidance on?";
            newContext = null;
          }
        }
      }

      // Update context
      setCurrentContext(newContext);

      // Add fallback response with delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            type: 'bot',
            content: botReply,
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
      }, 1000);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!open) {
  return (
      <button
        className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-200 hover:scale-110"
        onClick={() => setOpen(true)}
        aria-label="Open AI Mentor"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white shadow-xl rounded-xl z-50 transition-all duration-300 overflow-hidden ${
        minimized ? 'w-64 h-12' : 'w-96 h-[32rem] max-h-[80vh]'
      }`}
    >
      {/* Chat header */}
      <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-medium">EduSpark AI Mentor</h3>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-white/90 hover:text-white p-1 rounded"
            aria-label={minimized ? 'Expand chat' : 'Minimize chat'}
          >
            {minimized ? <MessageCircle size={18} /> : <MinusCircle size={18} />}
          </button>
            <button
              onClick={() => setOpen(false)}
            className="text-white/90 hover:text-white p-1 rounded"
            aria-label="Close chat"
            >
            <X size={18} />
            </button>
          </div>
      </div>

      {!minimized && (
        <>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 h-[calc(32rem-8rem)]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative max-w-3/4 px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{message.content}</div>
                  <span
                    className={`block text-xs mt-1 ${
                      message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg rounded-bl-none flex items-center">
                  <Loader className="w-4 h-4 mr-2 animate-spin text-primary-600" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSubmit} className="border-t p-3 flex items-center bg-white">
          <input
              ref={inputRef}
            type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask for career advice, resources..."
              className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
              disabled={loading}
            />
            <button
              type="submit"
              className={`bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AIMentor;