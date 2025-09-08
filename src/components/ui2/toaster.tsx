"use client"

import {
  Toast,
  ToastProvider,
  ToastTitle,
  ToastDescription,
  ToastViewport,
} from "@radix-ui/react-toast"

export function Toaster() {
  return (
    <ToastProvider>
      <Toast>
        <ToastTitle>Notification</ToastTitle>
        <ToastDescription>Something happened!</ToastDescription>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}
