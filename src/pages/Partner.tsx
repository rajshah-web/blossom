import { useState } from "react";
import { QrCode, Share2, Info, Bell, UserPlus } from "lucide-react";
import { cn } from "../lib/utils";

export default function Partner() {
  const [sharingEnabled, setSharingEnabled] = useState(true);
  const [alerts, setAlerts] = useState({
    fertile: true,
    period: true,
    mood: false,
  });

  const toggleAlert = (key: keyof typeof alerts) => {
    setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-serif text-[var(--color-text-dark)] flex items-center gap-2">
          Partner 💑
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Share</span>
          <button
            onClick={() => setSharingEnabled(!sharingEnabled)}
            className={cn(
              "w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative",
              sharingEnabled ? "bg-[var(--color-rose-primary)]" : "bg-gray-300"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out",
                sharingEnabled ? "translate-x-6" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      {sharingEnabled && (
        <>
          {/* QR Code Card */}
          <div className="bg-[var(--color-bg-card)] p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col items-center space-y-4 transition-colors duration-300">
            <div className="w-48 h-48 bg-[var(--color-bg-chip)] rounded-xl flex items-center justify-center border-2 border-dashed border-[var(--color-border-light)] transition-colors duration-300">
              <QrCode className="w-24 h-24 text-[var(--color-text-muted)]" />
            </div>
            <p className="text-sm text-[var(--color-text-muted)] text-center">
              Have your partner scan this code to connect accounts.
            </p>
            <button className="flex items-center gap-2 text-[var(--color-rose-primary)] font-semibold text-sm hover:underline">
              <Share2 className="w-4 h-4" /> Or share link
            </button>
          </div>

          {/* Connected Partner Section */}
          <div className="bg-[var(--color-bg-card)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex items-center gap-4 transition-colors duration-300">
            <div className="w-12 h-12 rounded-full bg-[var(--color-rose-light)] flex items-center justify-center text-[var(--color-rose-dark)] font-bold text-lg">
              A
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-semibold text-lg text-[var(--color-text-dark)]">Alex</h3>
              <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Connected
              </p>
            </div>
            <button className="text-[var(--color-text-muted)] hover:text-[var(--color-rose-dark)]">
              <UserPlus className="w-5 h-5" />
            </button>
          </div>

          {/* Notification Toggles */}
          <div className="bg-[var(--color-bg-card)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-4 transition-colors duration-300">
            <h3 className="font-serif font-semibold text-lg flex items-center gap-2 text-[var(--color-text-dark)]">
              <Bell className="w-5 h-5 text-[var(--color-rose-primary)]" /> Alerts
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[var(--color-text-dark)]">
                <span className="text-sm font-medium">Fertile Window Alerts</span>
                <button
                  onClick={() => toggleAlert("fertile")}
                  className={cn(
                    "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out",
                    alerts.fertile ? "bg-[var(--color-rose-primary)]" : "bg-gray-300"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out", alerts.fertile ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
              <div className="flex justify-between items-center text-[var(--color-text-dark)]">
                <span className="text-sm font-medium">Period Start Alerts</span>
                <button
                  onClick={() => toggleAlert("period")}
                  className={cn(
                    "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out",
                    alerts.period ? "bg-[var(--color-rose-primary)]" : "bg-gray-300"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out", alerts.period ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
              <div className="flex justify-between items-center text-[var(--color-text-dark)]">
                <span className="text-sm font-medium">Mood Updates</span>
                <button
                  onClick={() => toggleAlert("mood")}
                  className={cn(
                    "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out",
                    alerts.mood ? "bg-[var(--color-rose-primary)]" : "bg-gray-300"
                  )}
                >
                  <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out", alerts.mood ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
            </div>
          </div>

          {/* Educational Section */}
          <div className="bg-[var(--color-rose-light)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col space-y-3 border border-[var(--color-rose-primary)]/20 transition-colors duration-300">
            <div className="flex items-center gap-2 text-[var(--color-rose-dark)]">
              <Info className="w-5 h-5" />
              <h3 className="font-serif font-semibold text-lg">Educational Tips</h3>
            </div>
            <p className="text-sm text-[var(--color-text-dark)] leading-relaxed">
              Help your partner understand your cycle phases and how they can best support you during different times of the month.
            </p>
            <button className="self-start px-4 py-2 bg-[var(--color-bg-card)] text-[var(--color-rose-primary)] rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-colors">
              Learn How to Support
            </button>
          </div>
        </>
      )}
    </div>
  );
}
