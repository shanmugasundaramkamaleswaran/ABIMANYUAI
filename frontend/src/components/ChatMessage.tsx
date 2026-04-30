import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isAbimanyu: boolean;
  animate?: boolean;
  showLeaf?: boolean;
  mood?: string;
}

const ChatMessage = ({ message, isAbimanyu, animate = true, showLeaf = false, mood }: ChatMessageProps) => {
  // Map moods to display names
  const moodDisplayMap: Record<string, string> = {
    fear: "Anxiety",
    anger: "Anger",
    grief: "Sorrow",
    confusion: "Confusion",
    weakness: "Weakness",
    patience: "Patience",
    determination: "Determination",
    sacrifice: "Sacrifice",
    bravery: "Courage"
  };

  const displayMood = mood && mood !== "bravery" ? moodDisplayMap[mood] || mood : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 max-w-3xl relative",
        isAbimanyu ? "self-start" : "self-end items-end",
        animate && "animate-fade-in"
      )}
    >
      <div className={cn(
        "flex gap-4",
        !isAbimanyu && "flex-row-reverse"
      )}>
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

        <div className="flex flex-col gap-2">
          {isAbimanyu && displayMood && (
            <div className="flex flex-col gap-1 mb-1">
              <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full w-fit">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-200">
                  Detected Mood: {displayMood}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full w-fit">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-200">
                  Abimanyu Guidance Mode Activated
                </span>
              </div>
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
      </div>
    </div>
  );
};

export default ChatMessage;
