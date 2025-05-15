
import { useState, useCallback } from "react";

export interface ToastProps {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  duration?: number;
  action?: React.ReactElement;
  type?: "default" | "success" | "error" | "warning" | "info";
  // The variant is used by shadcn/ui toast
  variant?: "default" | "destructive";
}

type ToastOptions = Omit<ToastProps, "message">;

interface Toast extends ToastProps {
  id: string;
  dismiss: () => void;
}

const DEFAULT_TOAST_DURATION = 5000;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((toastId?: string) => {
    setToasts((prevToasts) =>
      toastId
        ? prevToasts.filter((toast) => toast.id !== toastId)
        : []
    );
  }, []);

  const toast = useCallback(
    ({ title, description, type, duration = DEFAULT_TOAST_DURATION, ...props }: ToastProps) => {
      const id = props.id || String(Date.now());
      
      // Map type to variant for shadcn/ui compatibility
      const variant = type === "error" ? "destructive" : "default";

      setToasts((prevToasts) => [
        ...prevToasts,
        {
          id,
          title,
          description,
          duration,
          variant,
          ...props,
          dismiss: () => dismiss(id),
        },
      ]);

      if (duration !== Infinity) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }

      return id;
    },
    [dismiss]
  );

  // Helper methods
  toast.success = (message: string, options: ToastOptions = {}) => 
    toast({ title: "Success", description: message, type: "success", ...options });
  
  toast.error = (message: string, options: ToastOptions = {}) => 
    toast({ title: "Error", description: message, type: "error", ...options });
  
  toast.warning = (message: string, options: ToastOptions = {}) => 
    toast({ title: "Warning", description: message, type: "warning", ...options });
  
  toast.info = (message: string, options: ToastOptions = {}) => 
    toast({ title: "Info", description: message, type: "info", ...options });
    
  toast.dismiss = dismiss;

  return { toast, toasts, dismiss };
};

export { useToast as default, toast };
