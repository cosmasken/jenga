import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
  children
}: EmptyStateProps) {
  return (
    <div className={`text-center py-8 max-w-xs mx-auto ${className}`}>
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 text-electric/50">
          <Icon className="w-full h-full" />
        </div>
      )}
      <h3 className="font-orbitron text-lg font-bold text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-electric hover:bg-electric/80 text-black font-medium"
        >
          {action.label}
        </Button>
      )}
      
      {children}
    </div>
  );
}
