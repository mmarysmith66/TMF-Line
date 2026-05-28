import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STORAGE_KEY = "tmfline_chat_session";

const SUGGESTIONS = [
  "Which product fits a $40K monthly revenue retail store?",
  "How does RBF remittance differ from a loan?",
  "What credit score do I need for a long-term loan?",
  "Can I use HELOC for business expansion?",
];

function getSessionId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(getSessionId);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    let mounted = true;
    axios.get(`${API}/assistant/history/${sessionId}`).then(({ data }) => {
      if (mounted && data.messages?.length) setMessages(data.messages);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [sessionId]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    const next = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/assistant/chat`, { session_id: sessionId, message: msg });
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: "Sorry — I couldn't reach the assistant. Please try again or visit /contact to apply directly." }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        data-testid="chat-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full flex items-center justify-center text-[#03110b] shadow-2xl shadow-emerald-500/30 transition-transform hover:scale-105 active:scale-95"
        style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {!open && <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#09090b] pulse-dot" />}
      </button>

      {open && (
        <div
          data-testid="chat-panel"
          className="fixed bottom-24 right-5 z-40 w-[min(380px,calc(100vw-2rem))] max-h-[min(640px,calc(100vh-7rem))] flex flex-col rounded-2xl glass-strong overflow-hidden border border-white/10 shadow-2xl fade-up"
        >
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#10b981,#0ea5e9)" }}>
                <Sparkles className="h-4 w-4 text-[#03110b]" />
              </div>
              <div>
                <div className="text-sm text-white tracking-tight font-medium">TMF Line Assistant</div>
                <div className="font-mono text-[0.66rem] text-zinc-500 tracking-[0.18em] uppercase flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" /> Online
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3" data-testid="chat-messages">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="text-sm text-zinc-300 leading-relaxed">
                  Hi — I can help you find the right funding product, explain how RBF, HELOC, or long-term loans work, and qualify your needs in a minute. What are you exploring?
                </div>
                <div className="space-y-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      data-testid={`chat-suggestion-${i}`}
                      className="w-full text-left text-xs px-3 py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-emerald-400/20 text-zinc-300 hover:text-white transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`} data-testid={`chat-msg-${i}`}>
                <div className={`max-w-[88%] text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-emerald-500/15 border border-emerald-400/20 text-emerald-50 rounded-br-md"
                    : "bg-white/[0.04] border border-white/[0.06] text-zinc-200 rounded-bl-md"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start" data-testid="chat-loading">
                <div className="bg-white/[0.04] border border-white/[0.06] text-zinc-300 rounded-2xl rounded-bl-md px-3.5 py-3 flex gap-1.5 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06] p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                data-testid="chat-input"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about funding products, qualification, or rates…"
                className="flex-1 resize-none bg-[#0c0c0e] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 outline-none transition max-h-32"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                data-testid="chat-send"
                className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-[#03110b] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,#10b981,#0ea5e9)" }}
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[0.66rem] text-zinc-600 mt-2 px-1">Powered by Claude. Information is general guidance — not a commitment to lend.</p>
          </div>
        </div>
      )}
    </>
  );
}
