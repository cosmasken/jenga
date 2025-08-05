import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Home, UserPlus, LayoutDashboard, Users, Gavel, User, Moon, Sun } from "lucide-react";

const navItems = [
  { path: "/", label: "Landing", icon: Home },
  { path: "/onboarding", label: "Onboarding", icon: UserPlus },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/disputes", label: "Disputes", icon: Gavel },
  { path: "/profile", label: "Profile", icon: User },
];

export function Navigation() {
  const [location, setLocation] = useLocation();
  const { onboardingCompleted } = useStore();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Don't show navigation on landing page
  if (location === "/" || (!onboardingCompleted && location !== "/onboarding")) {
    return (
      <Button
        onClick={toggleTheme}
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 bg-[hsl(27,87%,54%)] text-white border-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] hover:border-[hsl(27,87%,49%)] rounded-full shadow-lg"
        data-testid="button-theme-toggle"
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hidden md:block">
        <div className="flex overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || 
              (item.path === "/dashboard" && location.startsWith("/group"));
            
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-[hsl(27,87%,54%)] text-[hsl(27,87%,54%)]"
                    : "border-transparent hover:border-[hsl(27,87%,54%)] text-gray-600 dark:text-gray-400"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="w-4 h-4 mr-2 inline" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || 
              (item.path === "/dashboard" && location.startsWith("/group"));
            
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center justify-center py-3 px-2 text-xs transition-colors ${
                  isActive
                    ? "text-[hsl(27,87%,54%)]"
                    : "text-gray-600 dark:text-gray-400"
                }`}
                data-testid={`nav-mobile-${item.label.toLowerCase()}`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle for Desktop */}
      <Button
        onClick={toggleTheme}
        variant="outline"
        size="icon"
        className="fixed top-4 right-4 z-50 bg-[hsl(27,87%,54%)] text-white border-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] hover:border-[hsl(27,87%,49%)] rounded-full shadow-lg hidden md:flex"
        data-testid="button-theme-toggle-desktop"
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>

      {/* Spacer for fixed navigation */}
      <div className="pt-16 pb-20 md:pb-0" />
    </>
  );
}
