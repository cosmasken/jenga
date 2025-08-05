import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, Bitcoin, Users, Coins, UserPlus, AlertTriangle, Clock, CheckCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        // Default variants - Light and Dark
        default: "border-gray-200 bg-white text-gray-900 shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
        destructive: "border-red-200 bg-white text-gray-900 shadow-md dark:border-red-800 dark:bg-gray-800 dark:text-gray-100",
        
        // ROSCA/Chama specific variants with Bitcoin yellow theming
        contribution: "border-[#F7931A]/30 bg-white text-gray-900 shadow-lg shadow-[#F7931A]/10 dark:border-[#F7931A]/50 dark:bg-gray-800 dark:text-gray-100 dark:shadow-[#F7931A]/20",
        payout: "border-emerald-200 bg-white text-gray-900 shadow-lg shadow-emerald-500/10 dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-100 dark:shadow-emerald-500/20",
        groupCreated: "border-[#F7931A]/40 bg-white text-gray-900 shadow-lg shadow-[#F7931A]/15 dark:border-[#F7931A]/60 dark:bg-gray-800 dark:text-gray-100 dark:shadow-[#F7931A]/25",
        memberJoined: "border-blue-200 bg-white text-gray-900 shadow-lg shadow-blue-500/10 dark:border-blue-700 dark:bg-gray-800 dark:text-gray-100 dark:shadow-blue-500/20",
        warning: "border-yellow-200 bg-white text-gray-900 shadow-lg shadow-yellow-500/10 dark:border-yellow-600 dark:bg-gray-800 dark:text-gray-100 dark:shadow-yellow-500/20",
        pending: "border-[#F7931A]/25 bg-white text-gray-900 shadow-lg shadow-[#F7931A]/8 dark:border-[#F7931A]/45 dark:bg-gray-800 dark:text-gray-100 dark:shadow-[#F7931A]/15",
        success: "border-green-200 bg-white text-gray-900 shadow-lg shadow-green-500/10 dark:border-green-700 dark:bg-gray-800 dark:text-gray-100 dark:shadow-green-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Icon mapping for different toast types
const toastIcons = {
  default: null,
  destructive: X,
  contribution: Bitcoin,
  payout: Coins,
  groupCreated: Users,
  memberJoined: UserPlus,
  warning: AlertTriangle,
  pending: Clock,
  success: CheckCircle,
} as const

// Icon background colors for different toast types (Light and Dark mode)
const iconBackgrounds = {
  default: 'bg-gray-100 dark:bg-gray-700',
  destructive: 'bg-red-100 dark:bg-red-900/30',
  contribution: 'bg-[#F7931A]/10 dark:bg-[#F7931A]/20',
  payout: 'bg-emerald-100 dark:bg-emerald-900/30',
  groupCreated: 'bg-[#F7931A]/15 dark:bg-[#F7931A]/25',
  memberJoined: 'bg-blue-100 dark:bg-blue-900/30',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30',
  pending: 'bg-[#F7931A]/8 dark:bg-[#F7931A]/15',
  success: 'bg-green-100 dark:bg-green-900/30',
} as const

// Icon colors for different toast types (Light and Dark mode)
const iconColors = {
  default: 'text-gray-600 dark:text-gray-300',
  destructive: 'text-red-600 dark:text-red-400',
  contribution: 'text-[#F7931A] dark:text-[#F7931A]',
  payout: 'text-emerald-600 dark:text-emerald-400',
  groupCreated: 'text-[#F7931A] dark:text-[#F7931A]',
  memberJoined: 'text-blue-600 dark:text-blue-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  pending: 'text-[#F7931A] dark:text-[#F7931A]',
  success: 'text-green-600 dark:text-green-400',
} as const

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  const IconComponent = variant ? toastIcons[variant] : null;
  const iconBg = variant ? iconBackgrounds[variant] : iconBackgrounds.default;
  const iconColor = variant ? iconColors[variant] : iconColors.default;
  
  // Add special Bitcoin glow effect for Bitcoin-themed toasts
  const isBitcoinThemed = variant === 'contribution' || variant === 'groupCreated' || variant === 'pending';
  
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        toastVariants({ variant }), 
        "p-4 backdrop-blur-sm",
        // Add subtle Bitcoin glow for Bitcoin-themed toasts
        isBitcoinThemed && "ring-1 ring-[#F7931A]/20 dark:ring-[#F7931A]/30",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 flex-1">
        {IconComponent && (
          <div className={cn(
            "flex-shrink-0 p-2.5 rounded-full transition-all duration-300",
            iconBg,
            // Add subtle pulse animation for Bitcoin-themed toasts
            isBitcoinThemed && "animate-pulse"
          )}>
            <IconComponent className={cn("h-4 w-4 transition-colors duration-300", iconColor)} />
          </div>
        )}
        <div className="flex-1 min-w-0 pt-0.5">
          {props.children}
        </div>
      </div>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 group-hover:opacity-100 dark:text-gray-500 dark:hover:text-gray-300 dark:focus:ring-gray-500 dark:focus:ring-offset-gray-800",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-1", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
