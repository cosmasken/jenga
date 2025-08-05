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
import { Home, UserPlus, LayoutDashboard, Users, Gavel, User, Moon, Sun, Copy, LogOut, Wallet } from "lucide-react";

const navItems = [
  { path: "/", label: "Landing", icon: Home },
  { path: "/onboarding", label: "Onboarding", icon: UserPlus },
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

  // Don't show navigation on landing page for non-authenticated users
  // or if user hasn't completed onboarding (except on onboarding page)
  if (!isLoggedIn || (location === "/" && !onboardingCompleted) || (!onboardingCompleted && location !== "/onboarding")) {
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
        <div className="flex items-center justify-between px-4">
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

          {/* Desktop User Menu */}
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {isLoggedIn && primaryWallet && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[hsl(27,87%,54%)] text-white">
                        {user?.email?.[0]?.toUpperCase() || primaryWallet.address?.[2]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.email || "Anonymous User"}
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden">
        <div className="grid grid-cols-6 gap-1">
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
          
          {/* Mobile User Menu */}
          {isLoggedIn && primaryWallet && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center justify-center py-3 px-2 text-xs text-gray-600 dark:text-gray-400">
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
                      {user?.email || "Anonymous User"}
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

      {/* Spacer for fixed navigation */}
      <div className="pt-16 pb-20 md:pb-0" />
    </>
  );
}
