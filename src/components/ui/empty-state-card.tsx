import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    disabled?: boolean;
  };
  variant?: "default" | "sky" | "success" | "warning" | "error";
}

const EmptyStateCard = React.forwardRef<HTMLDivElement, EmptyStateCardProps>(
  ({ 
    className, 
    title, 
    description, 
    icon, 
    action, 
    variant = "default",
    ...props 
  }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "sky":
          return "bg-sky-50 border-sky-200 dark:bg-sky-950 dark:border-sky-800";
        case "success":
          return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800";
        case "warning":
          return "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800";
        case "error":
          return "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800";
        default:
          return "glassmorphism border-gray-600";
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center p-8 rounded-xl border text-center space-y-4",
          getVariantStyles(),
          className
        )}
        {...props}
      >
        {icon && (
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            {icon}
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="font-orbitron text-xl font-bold text-white">
            {title}
          </h3>
          <p className="text-gray-300 max-w-md">
            {description}
          </p>
        </div>

        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant || "default"}
            disabled={action.disabled}
            className="mt-4"
          >
            {action.text}
          </Button>
        )}
      </div>
    );
  }
);
EmptyStateCard.displayName = "EmptyStateCard";

export { EmptyStateCard };
