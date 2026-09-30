import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-primary/15 text-primary",
        warning: "border-transparent bg-amber-500/15 text-amber-400",
        info: "border-transparent bg-sky-500/15 text-sky-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

export function badgeClass(variant: BadgeVariants["variant"], cls?: HTMLAttributes["class"]): string {
  return cn(badgeVariants({ variant }), cls);
}
