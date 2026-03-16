import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Youtube, Send, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MessageBubble from '@/components/agent/MessageBubble';

export default function Agent() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    initConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function initConversation() {
    const convs = await base44.agents.listConversations({ agent_name: 'youtube_seo_agent' });
    let conv;
    if (convs.length > 0) {
      conv = await base44.agents.getConversation(convs[0].id);
    } else {
      conv = await base44.agents.createConversation({
        agent_name: 'youtube_seo_agent',
        metadata: { name: 'YouTube SEO Session' }
      });
    }
    setConversation(conv);
    setMessages(conv.messages || []);

    base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages([...data.messages]);
      setSending(false);
    });
  }

  async function sendMessage() {
    if (!input.trim() || !conversation || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
  }

  const quickPrompts = [
    "Show me all my videos",
    "Optimize SEO for my latest video",
    "Which video needs the most improvement?",
    "Suggest better titles for my top 3 videos",
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">TubeAgent</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/Dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/Videos" className="hover:text-white transition-colors">Videos</Link>
            <Link to="/Agent" className="text-white font-medium">AI Agent</Link>
            <Link to="/Changes" className="hover:text-white transition-colors">Change Log</Link>
          </nav>
          <div className="w-24" />
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">YouTube SEO Agent</h1>
            <p className="text-gray-400 text-sm">AI-powered channel optimization</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-gray-900 rounded-2xl p-6 space-y-4 overflow-y-auto mb-4 min-h-[400px] max-h-[60vh]">
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium text-gray-400 mb-2">Ready to optimize your channel</p>
              <p className="text-sm">Ask me to analyze videos, suggest SEO improvements, or make changes directly.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {sending && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-800 rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => setInput(p)}
                className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors border border-gray-700"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask the agent to optimize your videos..."
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="bg-red-600 hover:bg-red-700 px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}