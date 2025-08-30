"use client"

import * as React from "react"
import { X, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  onClose: (id: string) => void
}

export function Toast({ id, title, description, variant = 'default', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 4000) // Auto dismiss after 4 seconds

    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
        "bg-card text-card-foreground border-border",
        variant === 'success' && "border-green-500/20 bg-green-50 dark:bg-green-950/30",
        variant === 'destructive' && "border-red-500/20 bg-red-50 dark:bg-red-950/30"
      )}
      role="alert"
    >
      {variant === 'success' && (
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
      )}
      
      <div className="flex-1 space-y-1">
        {title && (
          <div className={cn(
            "text-sm font-semibold",
            variant === 'success' && "text-green-800 dark:text-green-200",
            variant === 'destructive' && "text-red-800 dark:text-red-200"
          )}>
            {title}
          </div>
        )}
        {description && (
          <div className={cn(
            "text-sm",
            variant === 'success' && "text-green-700 dark:text-green-300",
            variant === 'destructive' && "text-red-700 dark:text-red-300",
            !variant || variant === 'default' && "text-muted-foreground"
          )}>
            {description}
          </div>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className={cn(
          "flex-shrink-0 rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
          variant === 'success' && "text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30",
          variant === 'destructive' && "text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
        )}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { 
  toasts: Array<{ id: string; title?: string; description?: string; variant?: 'default' | 'destructive' | 'success' }>
  onClose: (id: string) => void 
}) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onClose={onClose}
        />
      ))}
    </div>
  )
}