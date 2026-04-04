import { useState, useEffect } from "react";
import { format, differenceInDays, addDays } from "date-fns";
import { useTheme } from "../components/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

interface Cycle {
  id: string;
  userId: string;
  startDate: string;
  endDate: string | null;
}

export default function Home() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "cycles"), orderBy("startDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCycles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Cycle[];
      setCycles(fetchedCycles);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching cycles:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Calculations
  const averageCycleLength = 28; // Default, could be calculated dynamically
  let cycleDay = 0;
  let daysUntilNextPeriod = 0;
  let phaseName = "Unknown";
  let statusText = "Unknown";
  let statusColorClass = "text-[var(--color-text-muted)]";
  let phaseColorClass = "bg-gray-100 text-gray-500";
  let progressPercentage = 0;

  if (cycles.length > 0) {
    const mostRecentCycleStart = new Date(cycles[0].startDate);
    mostRecentCycleStart.setHours(0, 0, 0, 0);

    cycleDay = differenceInDays(today, mostRecentCycleStart) + 1;

    // Check if we are currently in a period
    const isActivePeriod = !cycles[0].endDate ||
      (new Date(cycles[0].endDate).getTime() >= today.getTime());

    if (isActivePeriod) {
      phaseName = "Menstrual Phase";
      statusText = "Period Blood";
      statusColorClass = "text-[var(--color-rose-primary)]";
      phaseColorClass = "bg-[var(--color-rose-light)] text-[var(--color-rose-dark)]";
    } else if (cycleDay >= 10 && cycleDay <= 15) {
      phaseName = "Fertile Window";
      statusText = cycleDay === 14 ? "Ovulation 🥚" : "Fertile ✨";
      statusColorClass = "text-[var(--color-teal-primary)]";
      phaseColorClass = "bg-[var(--color-teal-light)] text-[var(--color-teal-primary)]";
    } else {
      phaseName = cycleDay < 10 ? "Follicular Phase" : "Luteal Phase";
      statusText = "Safe ✨";
      statusColorClass = "text-[var(--color-text-dark)]";
      phaseColorClass = "bg-[var(--color-bg-chip)] text-[var(--color-text-muted)]";
    }

    // Next period estimation
    const nextPeriodDate = addDays(mostRecentCycleStart, averageCycleLength);
    daysUntilNextPeriod = differenceInDays(nextPeriodDate, today);

    if (daysUntilNextPeriod < 0) {
      daysUntilNextPeriod = 0; // Late
    }

    progressPercentage = Math.min(100, Math.max(0, ((cycleDay - 1) / averageCycleLength) * 100));
  }

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-serif text-[var(--color-text-dark)]">
            Good morning{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} 🌸
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
          <div
            className="absolute inset-0 rounded-full border-[12px] border-[var(--color-rose-primary)] transition-all duration-1000"
            style={{
              clipPath: `polygon(50% 50%, 50% 0%, ${progressPercentage <= 25 ? `${50 + (progressPercentage/25)*50}% 0%` : progressPercentage <= 50 ? `100% ${(progressPercentage-25)/25*50}%` : progressPercentage <= 75 ? `${100 - (progressPercentage-50)/25*50}% 100%` : `0% ${100 - (progressPercentage-75)/25*50}%`}, 0% 0%)`,
              opacity: cycles.length > 0 ? 1 : 0
            }}
          ></div>
          <div className="text-center z-10">
            <p className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Day</p>
            <p className="text-6xl font-bold font-serif text-[var(--color-rose-dark)] leading-none mb-2">
              {cycles.length > 0 ? cycleDay : "-"}
            </p>
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${phaseColorClass}`}>
              {cycles.length > 0 ? phaseName : "No Data"}
            </span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center flex flex-col justify-center items-center transition-colors duration-300">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Next Period</p>
          <p className="text-xl font-bold font-serif text-[var(--color-text-dark)]">
            {cycles.length > 0 ? `${daysUntilNextPeriod}d` : "-"}
          </p>
        </div>
        <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center flex flex-col justify-center items-center transition-colors duration-300">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Cycle Day</p>
          <p className="text-xl font-bold font-serif text-[var(--color-text-dark)]">
            {cycles.length > 0 ? `${cycleDay}/${averageCycleLength}` : "-"}
          </p>
        </div>
        <div className="bg-[var(--color-bg-card)] p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center flex flex-col justify-center items-center transition-colors duration-300">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Status</p>
          <p className={`text-xl font-bold font-serif ${statusColorClass}`}>
            {cycles.length > 0 ? statusText : "-"}
          </p>
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
