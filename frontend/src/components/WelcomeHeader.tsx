const WelcomeHeader = () => {
  return (
    <div className="text-center space-y-6 py-10 animate-fade-in">
      {/* Logo Container with Divine Glow */}
      <div className="relative inline-block">
        {/* Outer Aura Ring */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 blur-2xl animate-breathe" />

        {/* Sacred Circle Border */}
        <div className="absolute -inset-2 rounded-full border border-amber-500/30 animate-pulse-glow" />

        {/* Logo Image */}
        <div className="w-28 h-28 relative rounded-full overflow-hidden golden-glow border-2 border-amber-400/50 animate-float">
          <img
            src="/abimanyu_logo.png"
            alt="Abimanyu"
            className="w-full h-full object-cover"
          />
          {/* Shine Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        </div>
      </div>

      {/* Title Section */}
      <div className="space-y-3">
        {/* Main Title */}
        <h1 className="text-5xl sm:text-6xl font-bold abimanyu-title tracking-wider">
          Abimanyu
        </h1>

        {/* Sanskrit Subtitle */}
        <p className="text-gold text-lg font-light tracking-[0.3em] uppercase">
          ॐ Divine Wisdom
        </p>

        {/* Decorative Divider */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <div className="w-2 h-2 rounded-full bg-amber-500/50" />
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        </div>

        {/* Description */}
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm sm:text-base px-4">
          A gentle guide inspired by the timeless wisdom of the Bhagavad Gita.
          <span className="block mt-1 text-amber-200/60 italic">
            Share your thoughts, fears, or struggles — I'm here to listen and offer clarity.
          </span>
        </p>
      </div>
    </div>
  );
};

export default WelcomeHeader;
