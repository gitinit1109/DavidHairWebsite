import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, X, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const GREETING: ChatMessage = {
  role: 'model',
  text: '您好，我是大衛哥AI特助！關於男生/女生/化療假髮、門市預約或價格，都可以直接問我 😊',
};

// Floating AI customer-service widget backed by /api/chat (Gemini, streamed).
// Kept as its own component so its chat state doesn't re-render the rest of
// the (very large) App tree on every keystroke.
export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isStreaming) return;

    setError(null);
    setInput('');
    // Only send recent turns to the server — keeps the request small and fast.
    const history = messages.slice(-8).map(({ role, text }) => ({ role, text }));
    setMessages((prev) => [...prev, { role: 'user', text }, { role: 'model', text: '' }]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || '客服暫時無法回應，請稍後再試。');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      // Render each chunk as it arrives instead of waiting for the whole
      // reply — this is what makes the widget feel fast.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'model', text: accumulated };
          return next;
        });
      }

      if (!accumulated) {
        setMessages((prev) => prev.slice(0, -1));
        setError('客服暫時無法回應，請稍後再試或直接加 LINE 詢問。');
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setMessages((prev) => prev.slice(0, -1));
      setError(err?.message || '網路連線異常，請稍後再試。');
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      {/* Launcher */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[65] w-14 h-14 rounded-full bg-zinc-950 border-2 border-brand-500 text-brand-500 shadow-2xl flex items-center justify-center cursor-pointer"
        aria-label="AI 客服"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed bottom-24 right-6 z-[65] w-[90vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-3xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-zinc-950 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-zinc-950 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">大衛哥AI特助</p>
                <p className="text-zinc-400 text-[11px] leading-tight">通常會很快回覆您</p>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-brand-500 text-zinc-950 font-medium rounded-br-sm'
                        : 'bg-white text-zinc-700 border border-zinc-200 rounded-bl-sm'
                    }`}
                  >
                    {m.text || (isStreaming && i === messages.length - 1 ? (
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                    ) : '')}
                  </div>
                </div>
              ))}
              {error && (
                <p className="text-center text-xs text-red-500 font-medium px-2">{error}</p>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-100 flex items-center gap-2 shrink-0 bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="輸入您的問題…"
                disabled={isStreaming}
                className="flex-1 px-4 py-2.5 rounded-full bg-zinc-100 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
              />
              <button
                onClick={sendMessage}
                disabled={isStreaming || !input.trim()}
                className="w-10 h-10 shrink-0 rounded-full bg-zinc-950 text-brand-500 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                aria-label="送出"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
