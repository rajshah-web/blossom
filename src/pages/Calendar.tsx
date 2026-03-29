import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, isWithinInterval, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Heart, Info, Plus, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, orderBy, getDocs } from "firebase/firestore";

interface Cycle {
  id: string;
  userId: string;
  startDate: string;
  endDate: string | null;
}

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);

  const [showManualLog, setShowManualLog] = useState(false);
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");

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

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = monthStart;
  const endDate = monthEnd;

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  // Helper to check if a date is within any logged period
  const getCycleForDate = (date: Date) => {
    return cycles.find(cycle => {
      const start = parseISO(cycle.startDate);
      start.setHours(0,0,0,0);
      
      if (cycle.endDate) {
        const end = parseISO(cycle.endDate);
        end.setHours(23,59,59,999);
        return date >= start && date <= end;
      } else {
        const today = new Date();
        today.setHours(23,59,59,999);
        const maxEnd = new Date(start);
        maxEnd.setDate(maxEnd.getDate() + 9); // Cap at 10 days for display if no end date
        const effectiveEnd = today < maxEnd ? today : maxEnd;
        return date >= start && date <= effectiveEnd;
      }
    });
  };

  const isPeriodDay = (date: Date) => !!getCycleForDate(date);

  // Basic prediction logic (simplified for UI)
  const getDayStatus = (date: Date) => {
    if (isPeriodDay(date)) return "period";
    
    // Find the most recent cycle before this date
    const previousCycle = cycles.find(c => parseISO(c.startDate) < date);
    if (previousCycle) {
      const cycleStart = parseISO(previousCycle.startDate);
      cycleStart.setHours(0,0,0,0);
      
      const diffTime = Math.abs(date.getTime() - cycleStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Simplified estimation: ovulation around day 14, fertile window days 10-15
      if (diffDays === 14) return "ovulation";
      if (diffDays >= 10 && diffDays <= 15) return "fertile";
    }
    
    return "safe";
  };

  const selectedStatus = getDayStatus(selectedDate);
  const pregnancyChance = selectedStatus === "ovulation" ? "High" : selectedStatus === "fertile" ? "Medium" : "Low";
  
  // Find current active cycle (no end date)
  const activeCycle = cycles.find(c => !c.endDate);
  const cycleStartingOnSelected = cycles.find(c => isSameDay(parseISO(c.startDate), selectedDate));
  const completedCycleCoveringSelected = cycles.find(c => {
    if (!c.endDate) return false;
    const start = parseISO(c.startDate);
    const end = parseISO(c.endDate);
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
    return selectedDate >= start && selectedDate <= end;
  });

  const isSelectedAfterActiveStart = activeCycle && selectedDate > parseISO(activeCycle.startDate);

  const handleSaveManualLog = async () => {
    if (!user || !manualStart || !manualEnd) {
      alert("Please select both start and end dates.");
      return;
    }
    
    const start = new Date(manualStart);
    const end = new Date(manualEnd);
    
    if (end < start) {
      alert("End date cannot be before start date.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "cycles"), {
        userId: user.uid,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      setShowManualLog(false);
      setManualStart("");
      setManualEnd("");
    } catch (error) {
      console.error("Error logging period:", error);
      alert("Failed to log period.");
    }
  };

  const handleTogglePeriod = async () => {
    if (!user) return;
    
    try {
      if (cycleStartingOnSelected) {
        if (window.confirm("Delete this period log?")) {
          await deleteDoc(doc(db, "users", user.uid, "cycles", cycleStartingOnSelected.id));
        }
      } else if (completedCycleCoveringSelected) {
        if (window.confirm("Delete this period log?")) {
          await deleteDoc(doc(db, "users", user.uid, "cycles", completedCycleCoveringSelected.id));
        }
      } else if (activeCycle && isSelectedAfterActiveStart) {
        // Mark end date
        await updateDoc(doc(db, "users", user.uid, "cycles", activeCycle.id), {
          endDate: selectedDate.toISOString()
        });
      } else if (!activeCycle) {
        // Start new cycle
        await addDoc(collection(db, "users", user.uid, "cycles"), {
          userId: user.uid,
          startDate: selectedDate.toISOString(),
          endDate: null
        });
      }
    } catch (error) {
      console.error("Error updating period:", error);
      alert("Failed to update period. Please try again.");
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 pb-24">
      <h1 className="text-2xl font-bold font-serif text-[var(--color-text-dark)]">Calendar</h1>

      {activeCycle && (
        <div className="bg-[var(--color-rose-light)] p-4 rounded-2xl border border-[var(--color-rose-primary)]/20 flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-[var(--color-rose-primary)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[var(--color-rose-dark)]">Ongoing Period</p>
            <p className="text-xs text-[var(--color-rose-primary)] mt-1 leading-relaxed">
              Started on <strong>{format(parseISO(activeCycle.startDate), "MMMM do")}</strong>. 
              Select the end date on the calendar below and tap "Mark as Period End".
            </p>
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex justify-between items-center bg-[var(--color-bg-card)] p-4 rounded-t-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-colors duration-300">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-[var(--color-cream)] text-[var(--color-text-muted)] transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold font-serif">{format(currentDate, dateFormat)}</h2>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-[var(--color-cream)] text-[var(--color-text-muted)] transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[var(--color-bg-card)] p-4 rounded-b-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] -mt-6 pt-6 transition-colors duration-300">
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {weekDays.map((day, i) => (
            <div key={i} className="text-xs font-semibold text-[var(--color-text-muted)]">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center">
          {Array.from({ length: getDay(monthStart) }).map((_, i) => (
            <div key={`empty-${i}`} className="w-10 h-10"></div>
          ))}
          {days.map((day, i) => {
            const status = getDayStatus(day);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <div key={i} className="flex flex-col items-center justify-center relative">
                <button
                  onClick={() => isCurrentMonth && setSelectedDate(day)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all cursor-pointer",
                    !isCurrentMonth ? "text-gray-300 dark:text-gray-600 cursor-default" : "text-[var(--color-text-dark)] hover:opacity-80",
                    status === "period" && isCurrentMonth && "bg-[var(--color-rose-light)] text-[var(--color-rose-dark)]",
                    status === "fertile" && isCurrentMonth && "bg-[var(--color-teal-light)] text-[var(--color-teal-primary)]",
                    status === "ovulation" && isCurrentMonth && "bg-[var(--color-teal-primary)] text-white",
                    isSelected && isCurrentMonth && "ring-2 ring-offset-2 ring-[var(--color-rose-primary)] dark:ring-offset-[var(--color-bg-card)]",
                    status === "safe" && isCurrentMonth && !isSelected && "bg-transparent"
                  )}
                >
                  {format(day, "d")}
                  {status === "ovulation" && isCurrentMonth && <Heart className="w-3 h-3 absolute bottom-0 text-white fill-white" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center px-2 text-xs font-medium text-[var(--color-text-muted)]">
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-rose-light)]"></div>
          <span>Period</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-teal-light)]"></div>
          <span>Fertile</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-teal-primary)]"></div>
          <span>Ovulation</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded-full border border-[var(--color-border-light)]"></div>
          <span>Safe</span>
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="bg-[var(--color-bg-card)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-4 transition-colors duration-300">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-serif font-semibold text-lg">{format(selectedDate, "MMMM do, yyyy")}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {selectedStatus === "period" ? "Menstrual Phase" : 
               selectedStatus === "fertile" || selectedStatus === "ovulation" ? "Fertile Window" : 
               "Follicular/Luteal Phase"}
            </p>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            pregnancyChance === "High" ? "bg-[var(--color-teal-light)] text-[var(--color-teal-primary)]" :
            pregnancyChance === "Medium" ? "bg-[var(--color-peach-light)] text-[var(--color-peach-primary)]" :
            "bg-[var(--color-bg-chip)] text-[var(--color-text-muted)]"
          )}>
            {pregnancyChance} Chance
          </div>
        </div>
        
        <div className="pt-4 border-t border-[var(--color-border-light)]">
          <h4 className="text-sm font-semibold text-[var(--color-text-dark)] mb-3">Period Logging</h4>
          
          {cycleStartingOnSelected || completedCycleCoveringSelected ? (
             <button onClick={handleTogglePeriod} className="w-full py-2.5 rounded-xl font-medium bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center gap-2">
               Remove Period Log
             </button>
          ) : activeCycle ? (
             <div className="space-y-3">
               <div className="flex items-center justify-between text-sm">
                 <span className="text-[var(--color-text-muted)]">Start Date:</span>
                 <span className="font-medium">{format(parseISO(activeCycle.startDate), "MMM d, yyyy")}</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                 <span className="text-[var(--color-text-muted)]">End Date:</span>
                 {isSelectedAfterActiveStart ? (
                   <span className="font-medium text-[var(--color-rose-primary)]">{format(selectedDate, "MMM d, yyyy")}</span>
                 ) : (
                   <span className="text-gray-400 italic">Select a future date above</span>
                 )}
               </div>
               <button 
                 onClick={handleTogglePeriod}
                 disabled={!isSelectedAfterActiveStart}
                 className={cn(
                   "w-full py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors",
                   isSelectedAfterActiveStart ? "bg-[var(--color-rose-primary)] text-white hover:bg-opacity-90" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                 )}
               >
                 <Check className="w-4 h-4" />
                 Save End Date
               </button>
             </div>
          ) : (
             <div className="space-y-3">
               <button 
                 onClick={handleTogglePeriod}
                 className="w-full py-2.5 rounded-xl font-medium bg-[var(--color-rose-light)] text-[var(--color-rose-primary)] hover:bg-opacity-80 flex items-center justify-center gap-2"
               >
                 <Plus className="w-4 h-4" />
                 Mark Start Date on {format(selectedDate, "MMM d")}
               </button>
               
               <div className="pt-2">
                 <button 
                   onClick={() => setShowManualLog(!showManualLog)}
                   className="text-xs text-center w-full text-[var(--color-text-muted)] hover:text-[var(--color-rose-primary)] transition-colors"
                 >
                   {showManualLog ? "Cancel manual log" : "Or log a past period manually"}
                 </button>
                 
                 {showManualLog && (
                   <div className="mt-3 space-y-2 p-3 bg-[var(--color-cream)] rounded-xl">
                     <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Start Date</label>
                          <input 
                            type="date" 
                            value={manualStart}
                            onChange={(e) => setManualStart(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white" 
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">End Date</label>
                          <input 
                            type="date" 
                            value={manualEnd}
                            onChange={(e) => setManualEnd(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-gray-200 bg-white" 
                          />
                        </div>
                     </div>
                     <button 
                       onClick={handleSaveManualLog} 
                       className="w-full py-2 rounded-lg text-xs font-medium bg-[var(--color-rose-primary)] text-white hover:bg-opacity-90"
                     >
                       Save Past Period
                     </button>
                   </div>
                 )}
               </div>
             </div>
          )}
        </div>
        
        <div className="pt-3 border-t border-[var(--color-border-light)] grid grid-cols-2 gap-3">
          <div className="bg-[var(--color-cream)] p-3 rounded-xl">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Pregnancy Chance</p>
            <p className="font-semibold text-[var(--color-text-dark)]">{pregnancyChance}</p>
          </div>
          <div className="bg-[var(--color-cream)] p-3 rounded-xl">
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Status</p>
            <p className="font-semibold text-[var(--color-text-dark)] capitalize">{selectedStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
