import React, { useState } from 'react';
import { MessageSquarePlus, Send, BookOpenText } from 'lucide-react';

export default function StartupQnAPage() {
  const [questions, setQuestions] = useState([
    {
      question: "What is the best funding option for seed-stage startups?",
      answer: "Seed-stage startups often benefit from angel investors, incubators, and early-stage VC funds."
    },
    {
      question: "How can I validate my startup idea quickly?",
      answer: "Build an MVP and gather user feedback. Lean startup methodology helps in fast validation."
    },
  ]);

  const [newQuestion, setNewQuestion] = useState('');

  const handleSubmit = () => {
    if (newQuestion.trim()) {
      setQuestions([{ question: newQuestion, answer: "Answer will be generated here..." }, ...questions]);
      setNewQuestion('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f6fc] via-[#dfe6e9] to-[#b2bec3] px-6 py-10">
      {/* Logo */}
      <h1 className="text-4xl font-extrabold text-[#273c75] tracking-tight mb-6">
        EduSpark
      </h1>

      {/* Header */}
      <header className="mb-8 text-center">
        <h2 className="text-5xl font-bold text-[#2d3436] flex justify-center items-center gap-2">
          <BookOpenText className="text-[#6c5ce7]" /> Q&A Section
        </h2>
        <p className="text-[#636e72] mt-2 text-lg italic">
          "Find answers. Ask questions. Grow smarter."
        </p>
      </header>

      {/* Question List */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-12">
        <h3 className="text-xl font-semibold text-[#2d3436] mb-4 flex items-center gap-2">
          <MessageSquarePlus className="text-[#00b894]" /> Previous Questions
        </h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {questions.map((item, index) => (
            <div key={index} className="border-b pb-3">
              <p className="font-semibold text-[#2d3436]">Q: {item.question}</p>
              <p className="text-[#636e72] mt-1">A: {item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ask New Question */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-[#2d3436] mb-4 flex items-center gap-2">
          <Send className="text-[#0984e3]" /> Ask a New Question
        </h3>
        <textarea
          rows={4}
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Type your question here..."
          className="w-full border p-3 rounded mb-4 resize-none"
        />
        <button
          onClick={handleSubmit}
          className="bg-[#6c5ce7] text-white px-6 py-2 rounded-full hover:bg-[#a29bfe] transition font-semibold"
        >
          Submit Question
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-[#636e72]">
        © {new Date().getFullYear()} EduSpark Hub. All rights reserved.
      </footer>
    </div>
  );
}
