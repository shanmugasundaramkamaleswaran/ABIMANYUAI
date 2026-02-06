import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isAbimanyu: boolean;
  animate?: boolean;
  showLeaf?: boolean;
}

const ChatMessage = ({ message, isAbimanyu, animate = true, showLeaf = false }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-4 max-w-3xl relative",
        isAbimanyu ? "self-start" : "self-end flex-row-reverse",
        animate && "animate-fade-in"
      )}
    >
      {isAbimanyu && (
        <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden shadow-divine border border-amber-500/30">
          <img
            src="/abimanyu_logo.png"
            alt="Abimanyu"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {showLeaf && (
        <div className="absolute -top-6 -left-2 w-8 h-8 opacity-90 animate-float z-20 pointer-events-none">
          <img
            src="/peepal_leaf.png"
            alt="Sacred Leaf"
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(230,201,122,0.4)]"
          />
        </div>
      )}

      <div
        className={cn(
          "px-5 py-4 rounded-2xl relative",
          isAbimanyu
            ? "glass-card rounded-tl-sm shadow-soft border-l-2 border-amber-500/30"
            : "gradient-divine text-primary-foreground rounded-tr-sm shadow-glow font-medium"
        )}
      >
        <div className={cn(
          "text-sm leading-relaxed",
          isAbimanyu ? "text-amber-50/90 prose prose-invert max-w-none" : "prose-none"
        )}>
          {isAbimanyu ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-amber-500/50 pl-4 py-1 my-3 bg-white/5 rounded-r-lg italic text-amber-200/80">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => <strong className="text-amber-400 font-bold">{children}</strong>
              }}
            >
              {message}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
