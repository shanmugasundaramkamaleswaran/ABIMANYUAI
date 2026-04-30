import { useState, useRef, useEffect } from "react";
import { Menu, Folder, ChevronRight } from "lucide-react";

interface MenuItemProps {
    title: string;
    desc: string;
    onClick?: () => void;
}

const MenuItem = ({ title, desc, onClick }: MenuItemProps) => (
    <button
        onClick={onClick}
        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-all group flex items-start gap-3"
    >
        <div className="mt-1 p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-primary-foreground transition-all">
            <Folder className="w-4 h-4" />
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground group-hover:text-amber-400 transition-colors">
                    {title}
                </h4>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                {desc}
            </p>
        </div>
    </button>
);

const TopMenu = ({ onOpenTracker }: { onOpenTracker: () => void }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-xl glass-card hover:bg-white/5 transition-all group border border-white/5"
            >
                <Menu className="w-5 h-5 text-foreground group-hover:text-amber-400 transition-colors" />
            </button>

            {open && (
                <div className="absolute left-0 mt-3 w-72 bg-[#0a0f2c]/95 backdrop-blur-md rounded-xl shadow-soft border border-white/10 animate-fade-in z-50 overflow-hidden">
                    <div className="p-2 border-b border-white/5 bg-white/5">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500/70 px-2">
                            Sacred Library
                        </span>
                    </div>
                    <div className="py-1">
                        <MenuItem
                            title="Mental Health Tracker"
                            desc="Track mood, stress & emotional patterns over time"
                            onClick={() => {
                                onOpenTracker();
                                setOpen(false);
                            }}
                        />
                        <MenuItem
                            title="Abipedia"
                            desc="Freedom fighters & legendary biographies from Indian history"
                        />
                    </div>
                    <div className="p-3 bg-white/5 border-t border-white/5 text-[10px] text-center text-muted-foreground italic">
                        "Knowledge is the soul's light"
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopMenu;
