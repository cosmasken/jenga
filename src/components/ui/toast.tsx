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
        default: "border-gray-200 bg-white text-gray-900 shadow-md",
        destructive: "border-red-200 bg-white text-gray-900 shadow-md",
        
        // ROSCA/Chama specific variants - all with white card-like backgrounds
        contribution: "border-green-200 bg-white text-gray-900 shadow-md",
        payout: "border-emerald-200 bg-white text-gray-900 shadow-md",
        groupCreated: "border-orange-200 bg-white text-gray-900 shadow-md",
        memberJoined: "border-blue-200 bg-white text-gray-900 shadow-md",
        warning: "border-yellow-200 bg-white text-gray-900 shadow-md",
        pending: "border-blue-200 bg-white text-gray-900 shadow-md",
        success: "border-green-200 bg-white text-gray-900 shadow-md",
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

// Icon background colors for different toast types
const iconBackgrounds = {
  default: 'bg-gray-100',
  destructive: 'bg-red-100',
  contribution: 'bg-green-100',
  payout: 'bg-emerald-100',
  groupCreated: 'bg-orange-100',
  memberJoined: 'bg-blue-100',
  warning: 'bg-yellow-100',
  pending: 'bg-blue-100',
  success: 'bg-green-100',
} as const

// Icon colors for different toast types
const iconColors = {
  default: 'text-gray-600',
  destructive: 'text-red-600',
  contribution: 'text-green-600',
  payout: 'text-emerald-600',
  groupCreated: 'text-orange-600',
  memberJoined: 'text-blue-600',
  warning: 'text-yellow-600',
  pending: 'text-blue-600',
  success: 'text-green-600',
} as const

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  const IconComponent = variant ? toastIcons[variant] : null;
  const iconBg = variant ? iconBackgrounds[variant] : iconBackgrounds.default;
  const iconColor = variant ? iconColors[variant] : iconColors.default;
  
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), "p-4", className)}
      {...props}
    >
      <div className="flex items-start gap-3 flex-1">
        {IconComponent && (
          <div className={cn("flex-shrink-0 p-2 rounded-full", iconBg)}>
            <IconComponent className={cn("h-4 w-4", iconColor)} />
          </div>
        )}
        <div className="flex-1 min-w-0">
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
      "absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 group-hover:opacity-100",
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
    className={cn("text-sm font-semibold", className)}
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
    className={cn("text-sm opacity-90", className)}
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
