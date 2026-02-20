import React, { useState, useEffect } from 'react';

const BreathingCircle = () => {
    const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

    useEffect(() => {
        const interval = setInterval(() => {
            setPhase(prev => (prev === 'inhale' ? 'exhale' : 'inhale'));
        }, 4000); // 4 seconds inhale, 4 seconds exhale

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center gap-8 animate-fade-in">
            <div className="relative flex items-center justify-center">
                {/* Outer Glow */}
                <div
                    className={`absolute w-40 h-40 rounded-full bg-amber-500/20 blur-2xl transition-all duration-[4000ms] ease-in-out ${phase === 'inhale' ? 'scale-150 opacity-40' : 'scale-100 opacity-20'
                        }`}
                />

                {/* Main Circle */}
                <div
                    className={`relative w-32 h-32 rounded-full border-2 border-amber-500/40 flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${phase === 'inhale' ? 'scale-150' : 'scale-100'
                        }`}
                >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 backdrop-blur-sm" />

                    {/* Pulsing Core */}
                    <div className="absolute w-8 h-8 rounded-full bg-amber-500/40 animate-ping" />
                </div>
            </div>

            <div className="text-center">
                <h3 className="text-lg font-medium text-amber-200 uppercase tracking-[0.3em] animate-pulse">
                    {phase === 'inhale' ? 'Inhale' : 'Exhale'}
                </h3>
                <p className="text-[10px] text-amber-500/60 uppercase tracking-widest mt-2">
                    Keep your gaze steady
                </p>
            </div>
        </div>
    );
};

export default BreathingCircle;
