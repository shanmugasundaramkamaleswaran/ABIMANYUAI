import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { Info, Target, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { AnalyticsData } from "@/lib/api";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0a0f2c]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl animate-fade-in">
                <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-2">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}
                            </span>
                            <span className="text-xs font-bold text-foreground">{entry.value}/10</span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[9px] text-muted-foreground italic">
                    "Stability is the foundation of growth."
                </div>
            </div>
        );
    }
    return null;
};

interface MentalHealthGraphProps {
    data: AnalyticsData[];
    loading?: boolean;
}

const MentalHealthGraph = ({ data, loading }: MentalHealthGraphProps) => {
    // Calculate averages and insights based on real data
    const avgMood = data.length > 0 
        ? (data.reduce((acc, curr) => acc + curr.mood, 0) / data.length).toFixed(1)
        : "5.0";
    
    const clarity = data.length > 1
        ? (((data[data.length - 1].mood - data[0].mood) / data[0].mood) * 100).toFixed(0)
        : "0";

    const getInsight = () => {
        if (data.length < 2) return "Continue your journey with Abimanyu to build your spiritual profile.";
        const last = data[data.length - 1];
        if (last.mood >= 8) return "Your inner peace is flourishing. Your consistency in duty is bearing fruit.";
        if (last.stress >= 7) return "You are carrying a heavy burden. Remember that you are only responsible for your actions, not the outcomes.";
        return "Your trajectory is stabilizing. Stay focused on your Dharma.";
    };

    const getDharmaGoal = () => {
        if (data.length < 1) return "Initiate your first dialogue.";
        const last = data[data.length - 1];
        if (last.strength < 5) return "Focus on building inner strength through detachment.";
        return "Maintain your current equilibrium and seek higher clarity.";
    };

    return (
        <div className="w-full bg-[#0a0f2c]/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/10 animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold abimanyu-title">Inner Wellness Analytics</h2>
                        <div className="bg-amber-500/10 text-amber-500 p-1 rounded-md">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-light italic">Tracking your spiritual and emotional trajectory.</p>
                </div>

                <div className="flex gap-4">
                    <div className="glass-card px-4 py-2 rounded-2xl border border-white/5 flex flex-col items-center min-w-[80px]">
                        <span className="text-[10px] uppercase tracking-tighter text-muted-foreground">Avg. Mood</span>
                        <span className="text-xl font-bold text-blue-500">{avgMood}</span>
                    </div>
                    <div className="glass-card px-4 py-2 rounded-2xl border border-white/5 flex flex-col items-center min-w-[80px]">
                        <span className="text-[10px] uppercase tracking-tighter text-muted-foreground">Growth</span>
                        <span className="text-xl font-bold text-amber-400">{Number(clarity) >= 0 ? '+' : ''}{clarity}%</span>
                    </div>
                </div>
            </div>

            {/* Main Charts Overlay */}
            <div className="w-full h-[400px] relative group flex items-center justify-center">
                {loading ? (
                    <div className="flex flex-col items-center gap-4 text-amber-500/50">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm tracking-widest uppercase font-bold">Consulting Akashic Records...</span>
                    </div>
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none rounded-3xl" />
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="rgba(255,255,255,0.03)"
                                />

                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 300 }}
                                    dy={15}
                                />

                                <YAxis
                                    hide={true}
                                    domain={[0, 10]}
                                />

                                <Tooltip content={<CustomTooltip />} isAnimationActive={false} />

                                <ReferenceLine y={5} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" label={{ position: 'right', value: 'Equilibrium', fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />

                                <Area
                                    name="Inner Peace"
                                    type="monotone"
                                    dataKey="mood"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorMood)"
                                    animationDuration={1000}
                                />

                                <Area
                                    name="Emotional Strength"
                                    type="monotone"
                                    dataKey="strength"
                                    stroke="#d97706"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorStrength)"
                                    animationDuration={1200}
                                />
                                
                                <Area
                                    name="Stress Level"
                                    type="monotone"
                                    dataKey="stress"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    fill="transparent"
                                    animationDuration={1400}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </>
                )}
            </div>

            {/* Insights Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3 hover:border-blue-500/20 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-semibold">Weekly Insight</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-light">
                        {getInsight()}
                    </p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3 hover:border-amber-500/20 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-[#0a0f2c] transition-all">
                            <Target className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-semibold">Dharma Goal</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-light">
                        {getDharmaGoal()}
                    </p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-muted/20 text-muted-foreground group-hover:bg-white group-hover:text-black transition-all">
                            <Info className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-semibold">Analysis Status</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-light">
                        Showing results from your last {data.length} interactions. Continuous dialogue improves accuracy.
                    </p>
                </div>
            </div>

            {/* Action Footer */}
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full border border-white/5">
                    <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-spin' : 'bg-green-500 animate-pulse'}`} />
                    {loading ? 'Consulting Wisdom...' : 'Live Analysis Active'}
                </div>
                <button 
                    disabled={loading || data.length === 0}
                    className="text-xs font-bold abimanyu-title hover:scale-105 transition-all bg-white/5 px-6 py-2 rounded-full border border-blue-500/20 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Generate Full Spiritual Audit
                </button>
            </div>
        </div>
    );
};

export default MentalHealthGraph;
