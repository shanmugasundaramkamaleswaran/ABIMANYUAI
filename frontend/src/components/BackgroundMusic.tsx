import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const BackgroundMusic = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.2); // Default "mild" volume
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        // Create audio element
        const audio = new Audio('/krishna_flute.mp3');
        audio.loop = true;
        audio.volume = volume;
        audioRef.current = audio;

        // Browser policy: Autoplay requires user interaction
        const handleFirstInteraction = () => {
            if (!hasInteracted) {
                setHasInteracted(true);
                audio.play().then(() => {
                    setIsPlaying(true);
                }).catch(err => {
                    console.error("Audio playback failed:", err);
                });
                window.removeEventListener('click', handleFirstInteraction);
                window.removeEventListener('touchstart', handleFirstInteraction);
            }
        };

        window.addEventListener('click', handleFirstInteraction);
        window.addEventListener('touchstart', handleFirstInteraction);

        return () => {
            audio.pause();
            audioRef.current = null;
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex items-center gap-3 bg-[#0a0f2c]/80 backdrop-blur-md border border-amber-500/20 p-2 rounded-full shadow-lg animate-fade-in group">
            <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all active:scale-95"
                title={isPlaying ? "Pause Divine Flute" : "Play Divine Flute"}
            >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
            </button>

            <div className="flex items-center gap-2 overflow-hidden w-0 group-hover:w-28 transition-all duration-300">
                <Volume2 size={16} className="text-amber-500/60" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-amber-500/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
            </div>

            {!hasInteracted && !isPlaying && (
                <div className="absolute -top-12 right-0 bg-amber-500 text-[#0a0f2c] text-[10px] font-bold py-1 px-3 rounded-full animate-bounce whitespace-nowrap shadow-glow">
                    TAP TO ENABLE FLUTE 🪈
                </div>
            )}
        </div>
    );
};

export default BackgroundMusic;
