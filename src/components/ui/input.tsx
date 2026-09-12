import * as React from "react";
import { cn } from "../../lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded border border-line bg-paper px-3 text-sm tnum",
        "focus:border-board focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
