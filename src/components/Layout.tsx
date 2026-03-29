import { Outlet, NavLink } from "react-router-dom";
import { Home, Calendar as CalendarIcon, Heart, Lightbulb, Users, User } from "lucide-react";
import { cn } from "../lib/utils";
import { AdBanner } from "./AdBanner";
import { BlossomPetals } from "./BlossomPetals";

export default function Layout() {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/calendar", icon: CalendarIcon, label: "Calendar" },
    { to: "/log", icon: Heart, label: "Log" },
    { to: "/partner", icon: Users, label: "Partner" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex flex-col min-h-screen blossom-bg pb-[70px] transition-colors duration-300">
      <BlossomPetals />
      <main className="flex-1 overflow-y-auto relative z-10">
        <Outlet />
      </main>

      <div className="fixed bottom-[70px] left-0 right-0 max-w-md mx-auto">
        <AdBanner />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 h-[70px] bg-[var(--color-bg-card)] border-t border-[var(--color-border-light)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-50 transition-colors duration-300">
        <div className="flex justify-around items-center h-full max-w-md mx-auto px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
                  isActive ? "text-[var(--color-rose-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-dark)]"
                )
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
