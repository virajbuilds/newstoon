import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'

interface ToastProps {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  description?: string
  type?: 'success' | 'error'
}

export function Toast({ open, setOpen, title, description, type = 'error' }: ToastProps) {
  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastPrimitive.Root
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-4 rounded-lg p-4 shadow-lg ${
          type === 'error' ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'
        }`}
        open={open}
        onOpenChange={setOpen}
      >
        <div>
          <ToastPrimitive.Title className="font-semibold">{title}</ToastPrimitive.Title>
          {description && (
            <ToastPrimitive.Description className="mt-1 text-sm">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 hover:bg-black/5">
          <X className="h-4 w-4" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>
  )
}