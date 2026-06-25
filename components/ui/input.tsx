import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-red-900/50 bg-slate-950 px-2.5 py-1 text-base text-white transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-amber-300/50 focus-visible:border-amber-500 focus-visible:ring-3 focus-visible:ring-amber-500/30 focus-visible:shadow-lg focus-visible:shadow-amber-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-900/50 disabled:opacity-50 dark:bg-slate-950 dark:disabled:bg-slate-950/80",
        className
      )}
      {...props}
    />
  )
}

export { Input }
