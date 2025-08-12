import * as React from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface CountdownProps extends React.HTMLAttributes<HTMLDivElement> {
  days: number;
  hours: number;
  minutes: number;
  isLate?: boolean;
  label?: string;
}

const Countdown = React.forwardRef<HTMLDivElement, CountdownProps>(
  ({ className, days, hours, minutes, isLate = false, label = "Deadline", ...props }, ref) => {
    const timeColor = isLate ? "text-red-400" : "text-white";
    const bgColor = isLate ? "bg-red-500/20" : "bg-bitcoin/20";

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgColor)}>
          <Clock className={cn("w-4 h-4", isLate ? "text-red-400" : "text-bitcoin")} />
        </div>
        <div>
          <div className="text-sm text-gray-400">{label}</div>
          <div className={cn("text-xl font-bold font-mono", timeColor)}>
            {days > 0 && `${days}d `}
            {hours}h {minutes}m
          </div>
          {isLate && (
            <div className="text-xs text-red-400 font-medium">
              ⚠️ Late window active
            </div>
          )}
        </div>
      </div>
    );
  }
);
Countdown.displayName = "Countdown";

export { Countdown };
