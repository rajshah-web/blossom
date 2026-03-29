import { format } from "date-fns";
import { useTheme } from "../components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function Home() {
  const today = new Date();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-serif text-[var(--color-text-dark)]">
            Good morning, Blossom 🌸
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm">
            {format(today, "EEEE, MMMM do")}
          </p>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-[var(--color-bg-card)] text-[var(--color-text-dark)] shadow-sm border border-[var(--color-border-light)] hover:opacity-80 transition-opacity"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Cycle Phase Ring */}
      <div className="flex justify-center py-6">
        <div className="relative w-64 h-64 rounded-full border-[12px] border-[var(--color-rose-light)] flex items-center justify-center shadow-sm bg-[var(--color-bg-card)] transition-colors duration-300">
          <div className="absolute inset-0 rounded-full border-[12px] border-[var(--color-rose-primary)]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}></div>
          <div className="text-center z-10">
            <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Day</p>
            <p className="text-6xl font-bold font-serif text-[var(--color-rose-dark)] leading-none mb-2">14</p>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-teal-light)] text-[var(--color-teal-primary)] text-sm font-semibold">
              Fertile Window
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center flex flex-col justify-center items-center transition-colors duration-300">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Next Period</p>
          <p className="text-xl font-bold font-serif text-[var(--color-text-dark)]">14d</p>
        </div>
        <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center flex flex-col justify-center items-center transition-colors duration-300">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Cycle Day</p>
          <p className="text-xl font-bold font-serif text-[var(--color-text-dark)]">14/28</p>
        </div>
        <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center flex flex-col justify-center items-center transition-colors duration-300">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Status</p>
          <p className="text-xl font-bold font-serif text-[var(--color-teal-primary)]">Safe ✨</p>
        </div>
      </div>

      {/* Today's Log Summary */}
      <div className="bg-[var(--color-bg-card)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif font-semibold text-lg text-[var(--color-text-dark)]">Today's Log</h2>
          <button className="text-[var(--color-rose-primary)] text-sm font-semibold">Edit</button>
        </div>
        <div className="flex items-center space-x-3 text-[var(--color-text-muted)]">
          <div className="w-10 h-10 rounded-full bg-[var(--color-cream)] flex items-center justify-center text-lg transition-colors duration-300">
            📝
          </div>
          <p className="text-sm">No log yet today. How are you feeling?</p>
        </div>
      </div>
    </div>
  );
}
