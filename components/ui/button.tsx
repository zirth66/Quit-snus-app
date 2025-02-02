"use client"

import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-teal-600 hover:bg-teal-700',
      destructive: 'bg-red-600 hover:bg-red-700'
    };

    return (
      <button
        className={`text-white px-4 py-2 rounded ${variantClasses[variant]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button } 