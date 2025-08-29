import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { useSacco } from "@/hooks/useSacco";
import { useUserStore } from "../stores/userStore";
import HelpCenter from "./guides/HelpCenter";
import { Menu, Moon, Sun, HelpCircle, Wallet, User, LogOut, Copy, Check } from "lucide-react";
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [location, setLocation] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet, setShowAuthFlow, handleLogOut } = useDynamicContext();
  const { theme, setTheme } = useTheme();
  const { isConnected, connect } = useSacco();
  const { walletAddress } = useUserStore();

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Discover", href: "/discover" },
    { name: "Governance", href: "#governance" },
    { name: "Analytics", href: "#analytics" },
  ];

  // Helper function to format wallet address
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Helper function to copy address to clipboard
  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  // Helper function to handle logout
  const handleLogout = async () => {
    try {
      await handleLogOut();
      // Redirect to landing page after successful logout
      setLocation('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout fails to ensure user is taken to landing
      setLocation('/');
    }
  };

  const WalletDropdown = () => {
    const walletAddress = primaryWallet?.address || "";
    
    if (!isLoggedIn || !walletAddress) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            data-testid="wallet-dropdown-trigger"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">{formatAddress(walletAddress)}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Wallet</p>
              <p className="text-xs leading-none text-muted-foreground">
                {formatAddress(walletAddress)}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => copyAddress(walletAddress)}
            className="cursor-pointer"
            data-testid="copy-address"
          >
            {isCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {isCopied ? "Copied!" : "Copy Address"}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer" data-testid="profile-link">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-red-600 focus:text-red-600"
            data-testid="logout-button"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };


  const NavLinks = ({ mobile = false, onClose = () => { } }) => (
    <>
      {isLoggedIn && navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          onClick={onClose}
          className={`${mobile
            ? "block text-neutral-300 hover:text-white transition-colors py-2"
            : "text-neutral-300 hover:text-white transition-colors"
            }`}
          data-testid={`link-${item.name.toLowerCase()}`}
        >
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2"
            data-testid="link-home"
          >
            <div className="w-8 h-8 bg-bitcoin rounded-full flex items-center justify-center text-black font-semibold text-sm">
              ₿
            </div>
            <span className="text-lg font-semibold">sacco</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLinks />

            {/* Wallet Dropdown - only show when logged in */}
            <WalletDropdown />

            {/* Help Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsHelpOpen(true)}
              data-testid="button-help"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-black border-neutral-800"
              >
                <div className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile onClose={() => setIsOpen(false)} />

                  {/* Wallet Section - only show when logged in */}
                  {isLoggedIn && primaryWallet?.address && (
                    <div className="pt-4 border-t border-neutral-800">
                      <div className="mb-4">
                        <p className="text-sm font-medium text-neutral-300 mb-2">Wallet</p>
                        <p className="text-xs text-neutral-400 mb-2">
                          {formatAddress(primaryWallet.address)}
                        </p>
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              copyAddress(primaryWallet.address);
                              setIsOpen(false);
                            }}
                            className="w-full justify-start"
                            data-testid="mobile-copy-address"
                          >
                            {isCopied ? (
                              <Check className="h-4 w-4 mr-2" />
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            {isCopied ? "Copied!" : "Copy Address"}
                          </Button>
                          <Button
                            variant="outline"
                            asChild
                            className="w-full justify-start"
                          >
                            <Link
                              href="/profile"
                              onClick={() => setIsOpen(false)}
                              data-testid="mobile-profile-link"
                            >
                              <User className="h-4 w-4 mr-2" />
                              Profile
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                            className="w-full justify-start text-red-600 hover:text-red-600"
                            data-testid="mobile-logout-button"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-neutral-800">

                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsHelpOpen(true);
                        setIsOpen(false);
                      }}
                      className="w-full mb-2"
                      data-testid="button-mobile-help"
                    >
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help Center
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      className="w-full"
                      data-testid="button-mobile-theme-toggle"
                    >
                      {theme === "light" ? (
                        <>
                          <Moon className="h-4 w-4 mr-2" />
                          Dark Mode
                        </>
                      ) : (
                        <>
                          <Sun className="h-4 w-4 mr-2" />
                          Light Mode
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Help Center Modal */}
      <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </nav>
  );
}
