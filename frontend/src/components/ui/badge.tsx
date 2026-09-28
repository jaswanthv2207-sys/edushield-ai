import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-200",
        secondary:
          "border-transparent bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        destructive:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
        outline: "text-foreground border-slate-300 dark:border-slate-700",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
        warning:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
        danger:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
        info: "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
        saffron:
          "border-transparent bg-saffron-100 text-saffron-700 dark:bg-saffron-900/50 dark:text-saffron-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
