import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-modern focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-corporate-navy to-corporate-navy/90 text-white hover:from-corporate-navy/90 hover:to-corporate-navy/80 hover:shadow-lg hover:shadow-corporate-navy/30 active:scale-[0.98] font-semibold",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-modern active:scale-[0.98]",
        outline:
          "border-2 border-corporate-navy/30 bg-background/50 backdrop-blur-sm text-corporate-navy hover:bg-corporate-navy hover:text-white hover:border-corporate-navy hover:shadow-lg hover:shadow-corporate-navy/20 active:scale-[0.98] font-medium",
        secondary:
          "bg-corporate-gray-light/20 text-corporate-navy hover:bg-corporate-gray-light/30 hover:shadow-modern active:scale-[0.98] font-medium",
        ghost: "text-corporate-navy hover:bg-corporate-navy/10 hover:text-corporate-navy active:scale-[0.98]",
        link: "text-corporate-navy underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
