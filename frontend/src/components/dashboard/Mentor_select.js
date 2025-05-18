import React, { useState } from 'react';

const sampleQA = [
  {
    question: "What is the difference between supervised and unsupervised learning?",
    answer: "Supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data."
  },
  {
    question: "What is overfitting in machine learning?",
    answer: "Overfitting occurs when a model learns the training data too well and performs poorly on new, unseen data."
  },
];

export default function QuestionAnswerPage() {
  const [qaList, setQaList] = useState(sampleQA);
  const [question, setQuestion] = useState('');

  const handleSubmit = () => {
    if (question.trim()) {
      setQaList([{ question, answer: "Answer will be provided shortly." }, ...qaList]);
      setQuestion('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f6fc] via-[#dfe6e9] to-[#b2bec3] px-6 py-10">
      <h1 className="text-4xl font-extrabold text-[#273c75] tracking-tight">EduSpark Q&A</h1>

      <header className="mb-10 mt-4">
        <h2 className="text-3xl font-bold text-[#2d3439]">Got Questions? We’ve Got Answers!</h2>
        <p className="text-[#636e72] mt-1 text-lg italic">
          "Explore common queries or ask your own below."
        </p>
      </header>

      {/* Previous Q&A */}
      <div className="space-y-6 mb-12">
        {qaList.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow p-5 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold text-[#2d3436] mb-2">
              ❓ {item.question}
            </h3>
            <p className="text-sm text-[#2d3436]">💡 {item.answer}</p>
          </div>
        ))}
      </div>

      {/* Ask a Question */}
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold mb-3 text-[#2d3436]">Ask a New Question</h3>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="Type your question here..."
          className="w-full p-3 border border-[#dfe6e9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0984e3] resize-none mb-4"
        />
        <button
          onClick={handleSubmit}
          className="bg-[#0984e3] text-white px-6 py-2 rounded-full hover:bg-[#74b9ff] transition"
        >
          Submit Question
        </button>
      </div>

      <footer className="mt-16 text-center text-sm text-[#636e72]">
        © {new Date().getFullYear()} EduSpark Hub. All rights reserved.
      </footer>
    </div>
  );
}
