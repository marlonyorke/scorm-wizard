import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      // Switch styling
      "relative w-12 h-6 flex items-center bg-muted rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-input",
      "data-[state=on]:bg-primary",
      className
    )}
    {...props}
  >
    <span
      className={cn(
        "absolute top-1/2 left-0.5 w-4 h-4 rounded-full bg-background border-2 border-primary shadow transition-transform duration-200 -translate-y-1/2",
        "data-[state=on]:translate-x-7",
        "data-[state=off]:translate-x-0"
      )}
    />
  </TogglePrimitive.Root>
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
