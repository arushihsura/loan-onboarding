'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, X, Send } from 'lucide-react';

const FAQ_RESPONSES = {
  loan: {
    keywords: ['loan', 'amount', 'emi', 'interest'],
    response: 'You can borrow between ₹50,000 to ₹25,00,000. For ₹3,00,000 at 10.5% for 36 months, EMI is ₹9,875.'
  },
  eligibility: {
    keywords: ['eligible', 'earn', 'income', 'salary', 'qualify'],
    response: 'You need minimum ₹15,000 monthly income. Run a quick eligibility check to see your pre-approved amount.'
  },
  documents: {
    keywords: ['document', 'required', 'kyc', 'proof'],
    response: 'We verify with your face, voice, and income. No documents needed for instant verification!'
  },
  status: {
    keywords: ['status', 'application', 'where', 'approved', 'decision'],
    response: 'Check your application status in the dashboard. Most approvals take 2-5 minutes.'
  },
  time: {
    keywords: ['how long', 'time', 'approval', 'quick', 'fast', 'minute'],
    response: 'Most approvals take 2-3 minutes with AI video verification. Instant offer generation!'
  },
  default: {
    response: 'How can I help? Ask about loans, eligibility, documents, or your application status.'
  }
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hi [>] I'm CrediBot. Ask me anything about your loan application!" }
  ]);
  const [input, setInput] = useState('');
  const { user } = useAuth();

  const getResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    for (const [key, data] of Object.entries(FAQ_RESPONSES)) {
      if (key === 'default') continue;
      if (data.keywords.some((keyword) => lowerMessage.includes(keyword))) {
        return data.response;
      }
    }
    return FAQ_RESPONSES.default.response;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { type: 'user', text: input }]);
    const botResponse = getResponse(input);
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: 'bot', text: botResponse }]);
    }, 300);
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#2f66c9] shadow-lg hover:bg-[#224f9f] transition"
      >
        <MessageCircle size={24} className="text-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-30 w-80 rounded-2xl border border-[#d7e3f8] bg-white shadow-2xl flex flex-col max-h-96">
          {/* Header */}
          <div className="blue-gradient rounded-t-2xl px-4 py-3 text-white flex justify-between items-center">
            <div>
              <h3 className="title-font text-sm font-bold">CrediBot Assistant</h3>
              <p className="text-xs text-white/80">24/7 loan assistance</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:opacity-80 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                    msg.type === 'user'
                      ? 'bg-[#2f66c9] text-white'
                      : 'bg-[#f5f8fc] text-[#1b3155] border border-[#d7e3f8]'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-[#d7e3f8] p-3 flex gap-2">
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 rounded-lg border border-[#d7e3f8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
            />
            <button
              onClick={handleSend}
              className="rounded-lg bg-[#2f66c9] px-3 py-2 text-white hover:bg-[#224f9f] transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
