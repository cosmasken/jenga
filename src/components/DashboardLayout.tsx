import { ReactNode } from "react";
import { Coins, Users, Send, Gift, LogOut } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  active: string;
}

const navItems = [
  {
    label: "Stacking",
    icon: <Coins className="w-5 h-5 mr-2" />,
    href: "/dashboard/stacking",
    key: "stacking",
  },
  {
    label: "Sacco Circles",
    icon: <Users className="w-5 h-5 mr-2" />,
    href: "/dashboard/circles",
    key: "circles",
  },
  {
    label: "P2P Transfers",
    icon: <Send className="w-5 h-5 mr-2" />,
    href: "/dashboard/p2p",
    key: "p2p",
  },
  {
    label: "Multisig Wallet",
    icon: <Users className="w-5 h-5 mr-2 text-yellow-300" />,
    href: "/dashboard/multisig",
    key: "multisig",
  },
  {
    label: "Giftcards",
    icon: <Gift className="w-5 h-5 mr-2 text-yellow-400" />,
    href: "/dashboard/giftcards",
    key: "giftcards",
    highlight: true,
  },
];

export const DashboardLayout = ({ children, active }: DashboardLayoutProps) => {
  const { user, logout } = useAppStore();

  return (
    <div className="min-h-screen flex bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-gradient-to-b from-orange-900 via-gray-900 to-black shadow-lg border-r border-gray-800">
        <div className="px-6 py-8 flex flex-col items-center border-b border-gray-800">
          <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
            <Coins className="w-8 h-8 text-black" />
          </div>
          <div className="font-extrabold text-2xl tracking-tight text-yellow-400 mb-1">JENGA</div>
          <div className="text-xs text-gray-400 font-mono">STACK • CIRCLE • SEND</div>
        </div>
        <nav className="flex-1 py-6 px-2 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg font-semibold transition-all",
                active === item.key
                  ? "bg-yellow-400 text-black shadow-md"
                  : item.highlight
                    ? "bg-gradient-to-r from-yellow-800/40 via-yellow-900/20 to-transparent hover:bg-yellow-900/30 text-yellow-300"
                    : "hover:bg-gray-900/70 text-gray-200"
              )}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-800 mt-auto">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 rounded-lg bg-gray-900 hover:bg-red-900 text-red-300 font-semibold transition-all"
          >
            <LogOut className="w-5 h-5 mr-2" /> Log out
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
        {children}
      </main>
    </div>
  );
};
