import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, ChevronRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

function ToolCall({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = toolCall?.status || 'pending';
  const name = toolCall?.name?.split('.').pop() || 'Action';

  const statusConfig = {
    pending: { icon: Loader2, color: 'text-gray-400', spin: false },
    running: { icon: Loader2, color: 'text-blue-400', spin: true },
    in_progress: { icon: Loader2, color: 'text-blue-400', spin: true },
    completed: { icon: CheckCircle2, color: 'text-green-400', spin: false },
    success: { icon: CheckCircle2, color: 'text-green-400', spin: false },
    failed: { icon: AlertCircle, color: 'text-red-400', spin: false },
    error: { icon: AlertCircle, color: 'text-red-400', spin: false },
  }[status] || { icon: Loader2, color: 'text-gray-400', spin: false };

  const Icon = statusConfig.icon;

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs bg-gray-800 hover:bg-gray-750 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
      >
        <Icon className={cn('w-3 h-3', statusConfig.color, statusConfig.spin && 'animate-spin')} />
        <span className="text-gray-300">{name.replace(/_/g, ' ')}</span>
        <ChevronRight className={cn('w-3 h-3 text-gray-500 transition-transform', expanded && 'rotate-90')} />
      </button>
      {expanded && toolCall.results && (
        <pre className="mt-1.5 ml-2 text-xs bg-gray-800 rounded-lg p-3 text-gray-400 overflow-auto max-h-32">
          {(() => { try { return JSON.stringify(JSON.parse(toolCall.results), null, 2); } catch { return toolCall.results; } })()}
        </pre>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4" />
        </div>
      )}
      <div className={cn('max-w-[85%]', isUser && 'flex flex-col items-end')}>
        {message.content && (
          <div className={cn(
            'rounded-2xl px-4 py-2.5',
            isUser ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-100'
          )}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown
                className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  code: ({ inline, children }) => inline
                    ? <code className="px-1 py-0.5 rounded bg-gray-700 text-red-300 text-xs">{children}</code>
                    : <pre className="bg-gray-900 rounded-lg p-3 overflow-x-auto my-2 text-xs"><code>{children}</code></pre>,
                  a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">{children}</a>,
                  p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                  li: ({ children }) => <li className="my-0.5">{children}</li>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {message.tool_calls?.length > 0 && (
          <div className="space-y-1 mt-1">
            {message.tool_calls.map((tc, i) => <ToolCall key={i} toolCall={tc} />)}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 bg-gray-700 rounded-lg flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}