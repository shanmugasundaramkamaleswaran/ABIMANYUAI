import { useState, useEffect } from "react";
import { Send, Sparkles, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "speechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "en-IN";

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };

      recog.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

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
        <div className="flex items-center gap-2 p-1">
          {/* Decorative Icon */}
          <div className="pl-3 text-amber-500/40">
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isListening ? "Listening..." : "Share what's on your mind..."}
            disabled={disabled}
            className="flex-1 bg-transparent px-2 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-50 font-light"
          />

          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={disabled || !recognition}
            className={cn(
              "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-30",
              isListening ? "bg-red-500/20 text-red-500 animate-pulse border border-red-500/30" : "bg-white/5 text-amber-500/60 hover:bg-white/10"
            )}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="flex-shrink-0 w-11 h-11 rounded-xl gradient-divine flex items-center justify-center text-primary-foreground transition-all hover:scale-105 hover:shadow-glow active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
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
