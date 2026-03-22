import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className="relative flex items-center justify-center cursor-pointer">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
        <div className={cn(
          "h-5 w-5 rounded border-2 border-primary/50 bg-transparent transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          "peer-checked:bg-primary peer-checked:border-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
          className
        )}>
           <Check className={cn("h-4 w-4 text-primary-foreground opacity-0 scale-50 transition-all peer-checked:opacity-100 peer-checked:scale-100", 
             checked ? "opacity-100 scale-100" : ""
           )} />
        </div>
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"
