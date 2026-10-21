import { createContext, useContext } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastApi {
  toast: (message: string, kind?: ToastKind) => void
}

export const ToastContext = createContext<ToastApi>({ toast: () => undefined })

export function useToast(): ToastApi {
  return useContext(ToastContext)
}
