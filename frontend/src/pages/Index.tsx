import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import WelcomeHeader from "@/components/WelcomeHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TopMenu from "@/components/TopMenu";
import MentalHealthGraph from "@/components/MentalHealthGraph";
import { sendMessage, getChatHistory, clearChatHistory } from "@/lib/api";
import { welcomeMessage } from "@/lib/abimanyu-responses";
import { useAuth } from "@/lib/AuthContext";
import { LogOut, Trash2, X, Wind } from "lucide-react";
import ThirukkuralCard from "@/components/ThirukkuralCard";
import BreathingCircle from "@/components/BreathingCircle";
import { getDailyKural } from "@/lib/thirukkural";

interface Message {
  id: string;
  text: string;
  isAbimanyu: boolean;
  mood?: string;
}

const Index = () => {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", text: welcomeMessage, isAbimanyu: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [isCalmActive, setIsCalmActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getChatHistory();
        if (history.length > 0) {
          const loadedMessages: Message[] = history.map((item, index) => ({
            id: `history-${item.id}-${index}`,
            text: item.content,
            isAbimanyu: item.is_ai
          }));
          setMessages([
            { id: "welcome", text: welcomeMessage, isAbimanyu: true },
            ...loadedMessages
          ]);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };
    loadHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      isAbimanyu: false
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      const response = await sendMessage(text);
      const abimanyuMessage: Message = {
        id: `abimanyu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: response.reply,
        isAbimanyu: true,
        mood: response.mood
      };

      setMessages(prev => [...prev, abimanyuMessage]);

      // Use Web Speech API to speak the response
      if ('speechSynthesis' in window) {
        const speak = () => {
          const utterance = new SpeechSynthesisUtterance(response.reply);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          const voices = window.speechSynthesis.getVoices();
          const maleVoice = voices.find(voice =>
            voice.name.toLowerCase().includes('male') ||
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('google uk english male')
          );
          if (maleVoice) utterance.voice = maleVoice;
          window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
        } else {
          speak();
        }
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      let errorText = "Sorry, I'm having trouble connecting right now. Please try again.";

      if (error.message?.includes('timed out')) {
        errorText = "The divine connection is taking longer than usual. Please check your internet or try again in a moment.";
      }

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: errorText,
        isAbimanyu: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleEmergencyCalm = () => {
    if (isCalmActive) {
      setIsCalmActive(false);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      setIsCalmActive(true);

      // Slow TTS
      const speak = () => {
        const msg = new SpeechSynthesisUtterance("meditate and control your mind follow the breathing");
        msg.rate = 0.6; // Extra slow
        window.speechSynthesis.speak(msg);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
      } else {
        speak();
      }
    }
  };

  const handleClearChat = async () => {
    try {
      setMessages([{ id: "welcome", text: welcomeMessage, isAbimanyu: true }]);
      await clearChatHistory();
    } catch (error) {
      console.error("Failed to clear history on server:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Sacred Cosmic Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Central Divine Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-purple-900/20 via-transparent to-transparent blur-3xl" />

        {/* Floating Orbs */}
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-amber-500/10 blur-3xl animate-breathe" />
        <div className="absolute top-40 right-[15%] w-48 h-48 rounded-full bg-purple-500/15 blur-2xl animate-breathe" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-32 left-[20%] w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl animate-breathe" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-[10%] w-56 h-56 rounded-full bg-amber-400/10 blur-2xl animate-breathe" style={{ animationDelay: "3s" }} />

        {/* Static Peacock Feather Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-40 pointer-events-none mix-blend-soft-light">
          <img
            src="/peacock_feather.png"
            alt="Divine Feather"
            className="w-full h-full object-contain filter brightness-125 contrast-125 drop-shadow-[0_0_30px_rgba(255,215,0,0.4)]"
          />
        </div>
      </div>

      {/* Top Navigation Bar - Dark Blue Theme */}
      <div className="fixed top-0 left-0 right-0 z-50 py-4 bg-[#0a0f2c] border-b border-white/5 shadow-lg">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex items-center justify-between">
          {/* Brand/Title & Menu on the Left */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-500/30">
                <img src="/abimanyu_logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-semibold abimanyu-title tracking-wider hidden xs:block">Abimanyu</span>
            </div>

            <TopMenu onOpenTracker={() => setShowTracker(true)} />

            <button
              onClick={toggleEmergencyCalm}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-500 group",
                isCalmActive
                  ? "bg-amber-500 text-white shadow-glow"
                  : "bg-white/5 hover:bg-white/10 text-amber-200/70 hover:text-amber-100 border border-white/10"
              )}
            >
              <Wind className={cn("w-3.5 h-3.5", isCalmActive && "animate-spin-slow")} />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
                {isCalmActive ? "Session Active" : "I feel overwhelmed"}
              </span>
            </button>
          </div>

          {/* Right Side Profile & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-white/10">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-foreground">{user?.name || user?.email}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{user?.email}</p>
              </div>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name || ''} className="w-9 h-9 rounded-full border border-amber-500/30 shadow-glow" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-medium text-sm shadow-divine">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-lg glass-card hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg glass-card hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-20" />

      {/* Main Content Container */}
      <div className="relative flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6">
        {/* Breathing Circle Overlay */}
        {isCalmActive && (
          <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none">
            <BreathingCircle />
          </div>
        )}

        {isCalmActive && (
          <div className="flex justify-center my-4 xl:hidden">
            <BreathingCircle />
          </div>
        )}

        {/* Header */}
        <WelcomeHeader />

        {/* Daily Wisdom Section */}
        <ThirukkuralCard kural={getDailyKural()} />

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 flex flex-col">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isAbimanyu={message.isAbimanyu}
              showLeaf={index === 0 && message.isAbimanyu}
              mood={message.mood}
            />
          ))}

          {isTyping && (
            <div className="self-start flex items-center gap-3 animate-fade-in mb-4">
              <div className="relative w-14 h-14 rounded-full overflow-visible">
                {/* Divine Mandala Overlay during contemplation */}
                <div className="sacred-mandala" />

                <div className="relative w-full h-full rounded-full overflow-hidden golden-glow z-10">
                  <img
                    src="/abimanyu_logo.png"
                    alt="Abimanyu"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/30 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm abimanyu-title tracking-wide">Abimanyu</span>
                <span className="text-[11px] text-amber-500/70 font-light italic">is contemplating...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 py-6">
          {messages.length > 1 && messages[messages.length - 1].isAbimanyu && messages[messages.length - 1].mood && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-fit animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="glass-card px-4 py-2 flex flex-col items-center gap-1 border border-amber-500/30 shadow-divine backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-200">
                    Detected Mood: {
                      (() => {
                        const lastMsg = messages[messages.length - 1];
                        const mood = lastMsg.mood;
                        if (!mood) return "None";
                        const map: Record<string, string> = {
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
                        return map[mood] || mood;
                      })()
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2 py-0.5 bg-amber-500/10 rounded-full">
                  <span className="text-[9px] uppercase tracking-widest font-medium text-amber-100/80">
                    Abimanyu Guidance Mode Activated
                  </span>
                </div>
              </div>
            </div>
          )}
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>

      {/* Mental Health Tracker Modal */}
      {showTracker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0f2c]/60 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-5xl scale-in-center">
            <button
              onClick={() => setShowTracker(false)}
              className="absolute -top-14 right-0 p-3 text-white/40 hover:text-white transition-all hover:rotate-90"
              title="Close Dashboard"
            >
              <X className="w-8 h-8" />
            </button>
            <MentalHealthGraph />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
