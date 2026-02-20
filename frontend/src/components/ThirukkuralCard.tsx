import React from 'react';
import { BookOpen } from 'lucide-react';
import { Thirukkural } from '@/lib/thirukkural';

interface ThirukkuralCardProps {
    kural: Thirukkural;
}

const ThirukkuralCard = ({ kural }: ThirukkuralCardProps) => {
    return (
        <div className="w-full mb-6 animate-fade-in">
            <div className="relative overflow-hidden glass-card p-4 border border-amber-500/20 shadow-divine group hover:border-amber-500/40 transition-all duration-500">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookOpen className="w-10 h-10 text-amber-500" />
                </div>

                <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">
                            இன்றைய குறள்
                        </h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
                    </div>

                    <div className="space-y-0.5">
                        <p className="text-sm font-medium text-amber-50 leading-relaxed font-serif tracking-wide italic">
                            "{kural.line1}"
                        </p>
                        <p className="text-sm font-medium text-amber-50 leading-relaxed font-serif tracking-wide italic">
                            "{kural.line2}"
                        </p>
                    </div>

                    {kural.meaning && (
                        <div className="mt-2 text-[11px] text-amber-200/60 leading-snug border-l border-amber-500/20 pl-3 py-1 italic">
                            <span className="font-bold mr-1">பொருள்:</span> {kural.meaning}
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-amber-500/40 font-mono tracking-tighter">
                            திருக்குறள் {kural.number}
                        </span>
                        <span className="text-[9px] text-amber-500/30 uppercase tracking-widest">
                            Daily Wisdom
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThirukkuralCard;
