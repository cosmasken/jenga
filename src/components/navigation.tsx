import { useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { useIsLoggedIn, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useUnitDisplay } from "@/contexts/UnitDisplayContext";
import type { DisplayUnit } from "@/lib/unitConverter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, LayoutDashboard, Users, Gavel, User, Moon, Sun, Copy, LogOut, Wallet } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/disputes", label: "Disputes", icon: Gavel },
  { path: "/profile", label: "Profile", icon: User },
];

export function Navigation() {
  const [location, setLocation] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet, user, handleLogOut } = useDynamicContext();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { displayUnit, setDisplayUnit } = useUnitDisplay();

  // Check onboarding completion from localStorage
  const onboardingCompleted = localStorage.getItem('jenga_onboarding_completed') === 'true';

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const copyAddress = () => {
    if (primaryWallet?.address) {
      navigator.clipboard.writeText(primaryWallet.address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const handleLogout = () => {
    handleLogOut();
    // Clear onboarding completion on logout
    localStorage.removeItem('jenga_onboarding_completed');
    localStorage.removeItem('jenga_user_display_name');
    localStorage.removeItem('jenga_invite_code');
    setLocation("/");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Don't render navigation if user is not logged in or hasn't completed onboarding
  if (!isLoggedIn || !onboardingCompleted) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 hidden md:block">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[hsl(27,87%,54%)] rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Jenga</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bitcoin Chama</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path ||
                (item.path === "/dashboard" && location.startsWith("/group"));

              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLocation(item.path)}
                  className={`flex items-center gap-2 ${isActive
                      ? "bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Select value={displayUnit} onValueChange={(value: DisplayUnit) => setDisplayUnit(value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cBTC">cBTC</SelectItem>
                <SelectItem value="satoshi">Satoshi</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="rounded-full w-9 h-9 p-0"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {primaryWallet && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-[hsl(27,87%,54%)] text-white text-sm">
                        {user?.email?.[0]?.toUpperCase() || primaryWallet.address?.[2]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.email || localStorage.getItem('jenga_user_display_name') || "Anonymous User"}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs leading-none text-muted-foreground font-mono">
                          {primaryWallet.address?.slice(0, 6)}...{primaryWallet.address?.slice(-4)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyAddress}
                          className="h-4 w-4 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 md:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path ||
              (item.path === "/dashboard" && location.startsWith("/group"));

            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center justify-center py-3 px-2 text-xs rounded-lg transition-colors ${isActive
                    ? "bg-[hsl(27,87%,54%)] text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Mobile User Menu */}
          {primaryWallet && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center py-3 px-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <Avatar className="w-5 h-5 mb-1">
                    <AvatarFallback className="bg-[hsl(27,87%,54%)] text-white text-xs">
                      {user?.email?.[0]?.toUpperCase() || primaryWallet.address?.[2]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">Account</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.email || localStorage.getItem('jenga_user_display_name') || "Anonymous User"}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs leading-none text-muted-foreground font-mono">
                        {primaryWallet.address?.slice(0, 6)}...{primaryWallet.address?.slice(-4)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyAddress}
                        className="h-4 w-4 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "light" ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                  <span>Toggle theme</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Select value={displayUnit} onValueChange={(value: DisplayUnit) => setDisplayUnit(value)}>
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cBTC">cBTC</SelectItem>
                      <SelectItem value="satoshi">Satoshi</SelectItem>
                    </SelectContent>
                  </Select>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>

      {/* Spacer for fixed navigation - improved mobile spacing */}
      <div className="pt-16 pb-16 md:pb-4" />
    </>
  );
}
