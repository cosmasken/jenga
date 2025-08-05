import { Bitcoin, Coins, TrendingUp, Rocket, Gem, Flame, Crown, Star } from "lucide-react";

export const avatarIcons = {
  bitcoin: Bitcoin,
  coins: Coins,
  'chart-line': TrendingUp,
  rocket: Rocket,
  gem: Gem,
  fire: Flame,
  crown: Crown,
  star: Star,
};

export const avatarColors = {
  bitcoin: 'text-[hsl(27,87%,54%)]',
  coins: 'text-yellow-500',
  'chart-line': 'text-green-500',
  rocket: 'text-blue-500',
  gem: 'text-purple-500',
  fire: 'text-red-500',
  crown: 'text-yellow-600',
  star: 'text-pink-500',
};

export function AvatarIcon({ type, className = "w-6 h-6" }: { type: string; className?: string }) {
  const Icon = avatarIcons[type as keyof typeof avatarIcons] || Bitcoin;
  const colorClass = avatarColors[type as keyof typeof avatarColors] || 'text-[hsl(27,87%,54%)]';
  
  return <Icon className={`${className} ${colorClass}`} />;
}
