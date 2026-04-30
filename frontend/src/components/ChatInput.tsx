import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Input Container with Glassmorphism */}
      <div className="glass-card rounded-2xl p-1.5 shadow-soft">
        <div className="flex items-center gap-3 p-1">
          {/* Decorative Icon */}
          <div className="pl-3 text-amber-500/40">
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share what's on your mind..."
            disabled={disabled}
            className="flex-1 bg-transparent px-2 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-50 font-light"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="flex-shrink-0 w-12 h-12 rounded-xl gradient-divine flex items-center justify-center text-primary-foreground transition-all hover:scale-105 hover:shadow-glow active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer Text */}
      <p className="text-xs text-muted-foreground/60 text-center mt-4 flex items-center justify-center gap-2">
        <span className="w-8 h-px bg-amber-500/20" />
        <span>Abimanyu is here to guide, not to replace professional help</span>
        <span className="w-8 h-px bg-amber-500/20" />
      </p>
    </form>
  );
};

export default ChatInput;
