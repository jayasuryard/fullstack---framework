import { useCallback, useRef, useState } from 'react'

export const useToast = () => {
  const [toasts, setToasts] = useState([])
  const nextToastId = useRef(0)

  const showToast = useCallback((message, type = 'success') => {
    nextToastId.current += 1
    const id = `toast-${nextToastId.current}`
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return {
    toasts,
    showToast,
    removeToast,
  }
}
