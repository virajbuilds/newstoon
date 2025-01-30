import React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'

interface ToastProps {
  open: boolean
  setOpen: (open: boolean) => void
  title: string
  description?: string
  type?: 'success' | 'error' | 'info'
}

export default function Toast({ open, setOpen, title, description, type = 'info' }: ToastProps) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type]

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      <ToastPrimitive.Root
        className={`${bgColor} text-white p-4 rounded-lg shadow-lg`}
        open={open}
        onOpenChange={setOpen}
      >
        <ToastPrimitive.Title className="font-medium">{title}</ToastPrimitive.Title>
        {description && (
          <ToastPrimitive.Description className="mt-1 text-sm opacity-90">
            {description}
          </ToastPrimitive.Description>
        )}
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-50" />
    </ToastPrimitive.Provider>
  )
}