"use client"

import { Toaster } from 'sonner'

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={false}
      duration={4000}
    />
  )
} 