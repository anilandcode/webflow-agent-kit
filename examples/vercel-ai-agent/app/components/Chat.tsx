'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Header */}
      <header className="border-b border-[var(--color-rule)] px-6 py-4 shrink-0">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--color-charcoal)]">
          Webflow Blog Manager
        </h1>
        <p className="text-sm text-[var(--color-charcoal-muted)]">
          AI agent managing your CMS — create, edit, publish, and manage blog posts
        </p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl mb-2">📝</p>
            <p className="text-[var(--color-charcoal-muted)] text-sm">
              Ask me to manage your Webflow blog.
            </p>
            <div className="mt-6 space-y-2 text-xs text-[var(--color-charcoal-muted)]">
              <p>Try: &quot;List all my Webflow sites&quot;</p>
              <p>Try: &quot;Create a blog post draft about AI trends in 2026&quot;</p>
              <p>Try: &quot;Show me all published blog posts&quot;</p>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[var(--color-charcoal)] text-white'
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-charcoal)] border border-[var(--color-rule)]'
              }`}
            >
              {/* Tool invocations */}
              {m.parts?.map((part, i) => {
                if (part.type === 'tool-invocation') {
                  const { toolInvocation } = part;
                  const isComplete = toolInvocation.state === 'result';
                  const isError = isComplete && 'error' in (toolInvocation.result ?? {});

                  return (
                    <div
                      key={i}
                      className={`my-2 p-2 rounded border text-xs font-mono ${
                        !isComplete
                          ? 'bg-[var(--color-tool-bg)] border-[var(--color-tool-border)]'
                          : isError
                            ? 'bg-red-50 border-red-300'
                            : 'bg-[var(--color-result-bg)] border-[var(--color-result-border)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--color-charcoal)]">
                          🔧 {toolInvocation.toolName}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            !isComplete ? 'bg-[var(--color-tool-border)] animate-pulse' : 'bg-[var(--color-result-border)]'
                          }`}
                        />
                      </div>
                      {isComplete && !isError && (
                        <pre className="whitespace-pre-wrap break-all text-[var(--color-charcoal-muted)]">
                          {JSON.stringify(toolInvocation.result, null, 2).slice(0, 300)}
                        </pre>
                      )}
                      {isError && (
                        <p className="text-red-600">Error: {String(toolInvocation.result)}</p>
                      )}
                    </div>
                  );
                }
                return null;
              })}

              {/* Text content */}
              {m.content && (
                <div className="whitespace-pre-wrap">{m.content}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-surface-muted)] border border-[var(--color-rule)] rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-charcoal-muted)] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-charcoal-muted)] animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-charcoal-muted)] animate-bounce [animation-delay:0.2s]" />
                </div>
                <span className="text-xs text-[var(--color-charcoal-muted)]">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--color-rule)] p-4 shrink-0"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="What do you want to do with your Webflow blog?"
            className="flex-1 border border-[var(--color-rule)] rounded-lg px-4 py-2.5 text-sm bg-white text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-muted)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 bg-[var(--color-charcoal)] text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-[10px] text-[var(--color-charcoal-muted)] mt-2 text-center">
          Powered by webflow-agent-kit · AI responses may contain errors · Not production advice
        </p>
      </form>
    </div>
  );
}
