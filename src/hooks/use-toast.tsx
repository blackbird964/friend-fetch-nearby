
// This file implements a toast hook that can be used inside React components
import * as React from "react";
import { createContext, useContext, useState, useCallback } from "react";

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

interface ToastContextState {
  toasts: Toast[];
  addToast: (props: ToastProps) => string;
  dismissToast: (toastId?: string) => void;
  dismissAll: () => void;
}

const DEFAULT_TOAST_DURATION = 5000;

// Create a React Context for the toast state
const ToastContext = createContext<ToastContextState | undefined>(undefined);

// Provider component that wraps your app and makes toast functions available
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const dismissToast = useCallback((toastId?: string) => {
    setToasts((prevToasts) =>
      toastId
        ? prevToasts.filter((toast) => toast.id !== toastId)
        : []
    );
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);
  
  const addToast = useCallback(
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
          dismiss: () => dismissToast(id),
        },
      ]);

      if (duration !== Infinity) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );
  
  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        dismissToast,
        dismissAll,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

// Hook to use the toast context
export function useToast() {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  const { addToast, dismissToast, dismissAll, toasts } = context;
  
  // Create a more convenient toast function with helper methods
  const toast = Object.assign(
    (props: ToastProps) => addToast(props),
    {
      success: (message: string, options: ToastOptions = {}) => 
        addToast({ title: "Success", description: message, type: "success", ...options }),
      
      error: (message: string, options: ToastOptions = {}) => 
        addToast({ title: "Error", description: message, type: "error", ...options }),
      
      warning: (message: string, options: ToastOptions = {}) => 
        addToast({ title: "Warning", description: message, type: "warning", ...options }),
      
      info: (message: string, options: ToastOptions = {}) => 
        addToast({ title: "Info", description: message, type: "info", ...options }),
        
      dismiss: dismissToast,
      dismissAll: dismissAll
    }
  );
  
  return {
    toast,
    toasts,
    dismiss: dismissToast,
  };
}

// Export just the types for external use
export type { Toast };
