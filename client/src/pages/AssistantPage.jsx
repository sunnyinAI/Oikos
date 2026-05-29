import { useEffect, useRef, useState } from 'react';
import { Bot, RotateCcw, SendHorizonal } from 'lucide-react';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { clearChatHistory, getChatHistory, streamAssistantChat } from '../lib/api';
import { useUIStore } from '../store/useUIStore';

const PROMPTS = [
  'What can I cook with the pantry items I already have?',
  'Which sabzi is cheaper in mandi versus delivery right now?',
  'Help me cut this month’s grocery spend by 10%',
  'Plan 3 vegetarian dinners under ₹500',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const { addToast } = useUIStore();

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        const history = await getChatHistory();
        if (active) {
          setMessages(history);
        }
      } catch {
        if (active) {
          addToast('Unable to load assistant history', 'error');
        }
      } finally {
        if (active) {
          setLoadingHistory(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [addToast]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (preset) => {
    const nextMessage = (preset || input).trim();
    if (!nextMessage || sending) return;

    const assistantId = `assistant-${Date.now()}`;
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: nextMessage,
    };
    const assistantMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };

    setInput('');
    setSending(true);
    setMessages((current) => [...current, userMessage, assistantMessage]);

    try {
      await streamAssistantChat(nextMessage, (_, fullText) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: fullText }
              : message,
          ),
        );
      });
    } catch (err) {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: err.message.includes('GEMINI_API_KEY') || err.message.includes('ANTHROPIC_API_KEY')
                  ? 'AI is not configured on the server yet. Add `GEMINI_API_KEY` in `.env` (or fallback `ANTHROPIC_API_KEY`) to enable Ask Oikos.'
                  : err.message,
              }
            : message,
        ),
      );
      addToast('Assistant reply failed', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    try {
      await clearChatHistory();
      setMessages([]);
      addToast('Chat history cleared', 'success');
    } catch {
      addToast('Unable to clear chat history', 'error');
    }
  };

  return (
    <div className="page-container flex h-full flex-col gap-4">
      <div className="rounded-2xl border border-saffron-200 bg-saffron-50 px-4 py-4 dark:border-saffron-900/40 dark:bg-saffron-950/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-saffron-900 dark:text-saffron-200">
              Ask Oikos
            </p>
            <p className="mt-1 text-sm text-saffron-800/80 dark:text-saffron-200/80">
              Recipes, grocery savings, budget advice and pantry-based cooking
              suggestions in Indian household context.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <RotateCcw size={16} />
          </Button>
        </div>
      </div>

      {loadingHistory && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!loadingHistory && messages.length === 0 && (
        <EmptyState
          icon="🤖"
          title="Start a chat with Oikos"
          description="Ask for recipe help, budget advice or smart shopping suggestions."
        />
      )}

      {!loadingHistory && messages.length > 0 && (
        <div className="flex-1 space-y-3 overflow-y-auto pb-2">
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                    isUser
                      ? 'rounded-br-lg bg-saffron-500 text-white'
                      : 'rounded-bl-lg bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  {!isUser && (
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <Bot size={12} />
                      Oikos
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-6">
                    {message.content || (sending && !isUser ? 'Thinking…' : '')}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 transition-colors hover:border-saffron-300 hover:text-saffron-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-3 rounded-3xl border border-gray-200 bg-white px-3 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <textarea
            rows={1}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about recipes, price savings or monthly budget..."
            className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent px-1 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
          >
            <SendHorizonal size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
