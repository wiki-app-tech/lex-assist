import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground border-border",
        subtle: "border-transparent bg-primary/10 text-primary dark:bg-primary/20",
        decreto: "border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-300",
        resolucion: "border-transparent bg-sky-500/15 text-sky-800 dark:text-sky-300",
        ley: "border-transparent bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
        licitacion: "border-transparent bg-purple-500/15 text-purple-800 dark:text-purple-300",
        biblioteca: "border-transparent bg-blue-500/15 text-blue-800 dark:text-blue-300",
        libro: "border-transparent bg-indigo-500/15 text-indigo-800 dark:text-indigo-300",
        doctrina: "border-transparent bg-rose-500/15 text-rose-800 dark:text-rose-300",
        revista: "border-transparent bg-teal-500/15 text-teal-800 dark:text-teal-300",
        digital: "border-transparent bg-violet-500/15 text-violet-800 dark:text-violet-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
