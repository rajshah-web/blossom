import { useState, useEffect } from "react";
import { Settings, Shield, User, LogOut, ChevronRight, Download, Calendar, Bell, Globe, Moon, Sun, Star } from "lucide-react";
import { cn } from "../lib/utils";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "../contexts/AuthContext";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { isNative } from "../lib/native";
import { Purchases } from "@revenuecat/purchases-capacitor";

export default function Profile() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [dailyReminders, setDailyReminders] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setDailyReminders(docSnap.data().dailyReminders || false);
        setIsPremium(docSnap.data().isPremium || false);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const toggleDarkMode = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const togglePremium = async () => {
    if (!user) return;
    
    if (isNative) {
      try {
        // Fetch available packages from RevenueCat
        const offerings = await Purchases.getOfferings();
        if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
          // Purchase the first available package (e.g., "Remove Ads")
          const { customerInfo } = await Purchases.purchasePackage({
            aPackage: offerings.current.availablePackages[0]
          });
          
          if (typeof customerInfo.entitlements.active['premium'] !== "undefined") {
            // User successfully purchased premium
            await updateDoc(doc(db, "users", user.uid), {
              isPremium: true
            });
          }
        }
      } catch (error: any) {
        if (!error.userCancelled) {
          console.error("Error purchasing premium:", error);
          alert("Failed to purchase premium.");
        }
      }
    } else {
      // Web fallback (mock purchase)
      try {
        await updateDoc(doc(db, "users", user.uid), {
          isPremium: !isPremium
        });
      } catch (error) {
        console.error("Error updating premium status:", error);
      }
    }
  };

  const toggleReminders = async () => {
    if (!user) return;
    
    const newValue = !dailyReminders;
    
    if (newValue) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification("Blossom Reminders Enabled", {
            body: "You will now receive daily reminders to log your updates!",
            icon: "/favicon.ico"
          });
        } else {
          alert("Please enable notifications in your browser settings to use this feature.");
          return;
        }
      } else {
        alert("Your browser does not support notifications.");
        return;
      }
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        dailyReminders: newValue
      });
    } catch (error) {
      console.error("Error updating reminders:", error);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto space-y-6 pb-24">
      <h1 className="text-2xl font-bold font-serif text-[var(--color-text-dark)]">Profile</h1>

      {/* User Profile Header */}
      <div className="bg-[var(--color-bg-card)] p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] flex flex-col items-center space-y-4 transition-colors duration-300">
        <div className="relative">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-24 h-24 rounded-full shadow-inner border-4 border-[var(--color-cream)] object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[var(--color-rose-light)] flex items-center justify-center text-3xl shadow-inner border-4 border-[var(--color-cream)]">
              🌸
            </div>
          )}
          <button className="absolute bottom-0 right-0 p-1.5 bg-[var(--color-bg-card)] rounded-full shadow-md border border-[var(--color-border-light)] hover:opacity-90 transition-colors">
            <Settings className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold font-serif text-[var(--color-text-dark)]">
            {user?.displayName || "Blossom User"}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {user?.email || "blossom@example.com"}
          </p>
        </div>
      </div>

      {/* Cycle Settings Card */}
      <div className="bg-[var(--color-bg-card)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-4 transition-colors duration-300">
        <h3 className="font-serif font-semibold text-lg text-[var(--color-text-dark)] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--color-rose-primary)]" /> Cycle Settings
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-3">
            <span className="text-sm font-medium text-[var(--color-text-dark)]">Average Cycle Length</span>
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <span>28 days</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-3">
            <span className="text-sm font-medium text-[var(--color-text-dark)]">Average Period Length</span>
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <span>5 days</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-[var(--color-text-dark)]">Goal</span>
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <span>Track Cycle</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Security Card */}
      <div className="bg-[var(--color-bg-card)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-4 transition-colors duration-300">
        <h3 className="font-serif font-semibold text-lg text-[var(--color-text-dark)] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--color-teal-primary)]" /> Privacy & Security
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-3">
            <span className="text-sm font-medium text-[var(--color-text-dark)]">Passcode Lock</span>
            <button className="w-10 h-5 rounded-full bg-gray-300 p-0.5 transition-colors duration-200 ease-in-out">
              <div className="w-4 h-4 rounded-full bg-white shadow-sm transform translate-x-0" />
            </button>
          </div>
          <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-3">
            <span className="text-sm font-medium text-[var(--color-text-dark)] flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Data
            </span>
            <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
          </div>
          <div className="flex justify-between items-center text-red-500">
            <span className="text-sm font-medium flex items-center gap-2">
               Delete Account
            </span>
          </div>
        </div>
      </div>

      {/* Account Card */}
      <div className="bg-[var(--color-bg-card)] p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] space-y-4 transition-colors duration-300">
        <h3 className="font-serif font-semibold text-lg text-[var(--color-text-dark)] flex items-center gap-2">
          <User className="w-5 h-5 text-[var(--color-purple-primary)]" /> Account
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-3">
            <span className="text-sm font-medium text-[var(--color-text-dark)] flex items-center gap-2">
              <Star className={cn("w-4 h-4", isPremium ? "text-yellow-500 fill-yellow-500" : "text-gray-400")} /> Premium (Remove Ads)
            </span>
            <button
              onClick={togglePremium}
              className={cn(
                "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out",
                isPremium ? "bg-[var(--color-rose-primary)]" : "bg-gray-300"
              )}
            >
              <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out", isPremium ? "translate-x-5" : "translate-x-0")} />
            </button>
          </div>
          <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-3">
            <span className="text-sm font-medium text-[var(--color-text-dark)] flex items-center gap-2">
              {isDark ? <Moon className="w-4 h-4 text-gray-400"/> : <Sun className="w-4 h-4 text-gray-400"/>} Dark Mode
            </span>
            <button
              onClick={toggleDarkMode}
              className={cn(
                "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out",
                isDark ? "bg-[var(--color-rose-primary)]" : "bg-gray-300"
              )}
            >
              <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out", isDark ? "translate-x-5" : "translate-x-0")} />
            </button>
          </div>
          <div className="flex flex-col border-b border-[var(--color-border-light)] pb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[var(--color-text-dark)] flex items-center gap-2">
                <Bell className="w-4 h-4" /> Daily Reminders
              </span>
              <button
                onClick={toggleReminders}
                className={cn(
                  "w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out",
                  dailyReminders ? "bg-[var(--color-rose-primary)]" : "bg-gray-300"
                )}
              >
                <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out", dailyReminders ? "translate-x-5" : "translate-x-0")} />
              </button>
            </div>
            {dailyReminders && (
              <button 
                onClick={() => {
                  if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("Blossom Daily Reminder", {
                      body: "Don't forget to log your symptoms and cycle updates today!",
                      icon: "/favicon.ico"
                    });
                  } else {
                    alert("Please enable notifications first.");
                  }
                }}
                className="text-xs text-[var(--color-rose-primary)] self-start hover:underline"
              >
                Send Test Notification
              </button>
            )}
          </div>
          <div className="flex justify-between items-center border-b border-[var(--color-border-light)] pb-3">
            <span className="text-sm font-medium text-[var(--color-text-dark)] flex items-center gap-2">
              <Globe className="w-4 h-4" /> Language
            </span>
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <span className="text-sm">English</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <div 
            onClick={logout}
            className="flex justify-between items-center text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)] cursor-pointer"
          >
            <span className="text-sm font-medium flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Log Out
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-[var(--color-text-muted)] pt-4">
        <p>App Version 1.0.0</p>
      </div>
    </div>
  );
}
