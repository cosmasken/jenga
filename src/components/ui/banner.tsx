import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

const bannerVariants = cva(
  "flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium",
  {
    variants: {
      variant: {
        success: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200",
        warning: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200",
        error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
        info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const iconMap = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

export interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bannerVariants> {
  message: string;
  showIcon?: boolean;
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({ className, variant = "info", message, showIcon = true, ...props }, ref) => {
    const Icon = iconMap[variant || "info"];

    return (
      <div
        ref={ref}
        className={cn(bannerVariants({ variant }), className)}
        {...props}
      >
        {showIcon && <Icon className="h-4 w-4 flex-shrink-0" />}
        <span className="flex-1">{message}</span>
      </div>
    );
  }
);
Banner.displayName = "Banner";

export { Banner, bannerVariants };
