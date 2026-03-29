import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import { InlineAd } from "../components/InlineAd";

const SYMPTOMS = {
  Flow: [
    { label: "None", icon: "💧" },
    { label: "Light", icon: "🩸" },
    { label: "Medium", icon: "🩸🩸" },
    { label: "Heavy", icon: "🩸🩸🩸" }
  ],
  Mood: [
    { label: "Happy", icon: "😊" },
    { label: "Calm", icon: "😌" },
    { label: "Anxious", icon: "😰" },
    { label: "Irritable", icon: "😠" },
    { label: "Sad", icon: "😢" }
  ],
  Cravings: [
    { label: "Sweet", icon: "🍫" },
    { label: "Salty", icon: "🥨" },
    { label: "Carbs", icon: "🍞" },
    { label: "None", icon: "🚫" }
  ],
};

export default function Log() {
  const [activeTab, setActiveTab] = useState<"log" | "insights">("log");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [painLevel, setPainLevel] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const toggleSymptom = (category: string, value: string) => {
    setSelected((prev) => ({
      ...prev,
      [category]: prev[category] === value ? "" : value,
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 max-w-md mx-auto space-y-6 pb-24"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-serif text-[var(--color-text-dark)]">
              {activeTab === "log" ? "Daily Log" : "Insights ✨"}
            </h1>
            <p className="text-[var(--color-text-muted)] text-sm">
              {format(new Date(), "EEEE, MMMM do")}
            </p>
          </div>
          {activeTab === "insights" && (
            <button className="p-2 rounded-full bg-[var(--color-bg-card)] shadow-sm text-[var(--color-rose-primary)] hover:opacity-80 transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[var(--color-bg-chip)] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("log")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "log" ? "bg-[var(--color-bg-card)] shadow-sm text-[var(--color-text-dark)]" : "text-[var(--color-text-muted)]"
            )}
          >
            Log
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "insights" ? "bg-[var(--color-bg-card)] shadow-sm text-[var(--color-text-dark)]" : "text-[var(--color-text-muted)]"
            )}
          >
            Insights
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "log" ? (
          <motion.div
            key="log"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Interactive Sliders */}
            <div className="bg-[var(--color-bg-card)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-4 transition-colors duration-300">
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-serif font-semibold text-lg">Pain Level</h3>
                  <motion.span 
                    key={painLevel}
                    initial={{ scale: 1.5, color: "var(--color-rose-dark)" }}
                    animate={{ scale: 1, color: "var(--color-rose-primary)" }}
                    className="font-bold"
                  >
                    {painLevel}/10
                  </motion.span>
                </div>
                <input 
                  type="range" 
                  min="0" max="10" 
                  value={painLevel} 
                  onChange={(e) => setPainLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--color-bg-chip)] rounded-lg appearance-none cursor-pointer accent-[var(--color-rose-primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
                  <span>None</span>
                  <span>Severe</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-light)]">
                <div className="flex justify-between mb-2">
                  <h3 className="font-serif font-semibold text-lg">Energy</h3>
                  <motion.span 
                    key={energyLevel}
                    initial={{ scale: 1.5, color: "var(--color-teal-dark)" }}
                    animate={{ scale: 1, color: "var(--color-teal-primary)" }}
                    className="font-bold"
                  >
                    {energyLevel}/10
                  </motion.span>
                </div>
                <input 
                  type="range" 
                  min="0" max="10" 
                  value={energyLevel} 
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full h-2 bg-[var(--color-bg-chip)] rounded-lg appearance-none cursor-pointer accent-[var(--color-teal-primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
                  <span>Exhausted</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            {/* Symptom Chips */}
            {Object.entries(SYMPTOMS).map(([category, options]) => (
              <div key={category} className="bg-[var(--color-bg-card)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-3 transition-colors duration-300">
                <h3 className="font-serif font-semibold text-lg">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {options.map((option) => {
                    const isSelected = selected[category] === option.label;
                    return (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={option.label}
                        onClick={() => toggleSymptom(category, option.label)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 border border-transparent",
                          isSelected
                            ? "bg-[var(--color-rose-primary)] text-white shadow-md"
                            : "bg-[var(--color-bg-chip)] text-[var(--color-text-dark)] hover:bg-[var(--color-border-light)]"
                        )}
                      >
                        <span>{option.icon}</span>
                        {option.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="bg-[var(--color-bg-card)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-3 transition-colors duration-300">
              <h3 className="font-serif font-semibold text-lg">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling today?"
                className="w-full min-h-[80px] p-3 bg-transparent border-[1.5px] border-[var(--color-border-light)] rounded-xl focus:outline-none focus:border-[var(--color-rose-primary)] resize-y text-[var(--color-text-dark)]"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className={cn(
                "w-full py-4 rounded-2xl font-semibold text-white text-lg transition-colors shadow-md",
                saved
                  ? "bg-green-500"
                  : "bg-gradient-to-r from-[var(--color-rose-primary)] to-[var(--color-peach-primary)]"
              )}
            >
              {saved ? "✓ Log Saved!" : "Save Log"}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="insights"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <InlineAd />

            {/* Insight Card 1 */}
            <div className="bg-[var(--color-purple-light)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col items-center text-center space-y-3 transition-colors duration-300">
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center text-2xl shadow-sm transition-colors duration-300">
                🍎
              </div>
              <h3 className="font-serif font-semibold text-lg text-[var(--color-purple-primary)]">Nutrition Tip</h3>
              <p className="text-sm text-[var(--color-text-dark)] leading-relaxed">
                You're entering your luteal phase. Focus on complex carbs and magnesium-rich foods like dark chocolate and spinach to help reduce PMS symptoms.
              </p>
            </div>

            {/* Insight Card 2 */}
            <div className="bg-[var(--color-teal-light)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col items-center text-center space-y-3 transition-colors duration-300">
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center text-2xl shadow-sm transition-colors duration-300">
                💤
              </div>
              <h3 className="font-serif font-semibold text-lg text-[var(--color-teal-primary)]">Sleep Recommendation</h3>
              <p className="text-sm text-[var(--color-text-dark)] leading-relaxed">
                Your body temperature naturally rises during this phase. Keep your bedroom slightly cooler tonight for optimal rest and recovery.
              </p>
            </div>

            {/* Insight Card 3 */}
            <div className="bg-[var(--color-peach-light)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col items-center text-center space-y-3 transition-colors duration-300">
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-card)] flex items-center justify-center text-2xl shadow-sm transition-colors duration-300">
                🧘‍♀️
              </div>
              <h3 className="font-serif font-semibold text-lg text-[var(--color-peach-primary)]">Wellness Advice</h3>
              <p className="text-sm text-[var(--color-text-dark)] leading-relaxed">
                Energy levels might dip slightly today. Consider swapping high-intensity workouts for gentle yoga or a brisk walk.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
