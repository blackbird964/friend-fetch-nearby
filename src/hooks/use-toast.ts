import * as React from "react"
import { toast as sonnerToast } from "sonner"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive" | "success"
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        setToastTimeout(toastId)
      } else {
        state.toasts.forEach((toast) => {
          setToastTimeout(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

function setToastTimeout(id: string) {
  if (toastTimeouts.has(id)) {
    clearTimeout(toastTimeouts.get(id))
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(id)
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(id, timeout)
}

export function useToast() {
  return {
    toast,
    dismiss: (toastId?: string) => {
      sonnerToast.dismiss(toastId);
    },
  }
}

type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  type?: "default" | "destructive" | "success"
  duration?: number
}

export const toast = ({ title, description, type, duration }: ToastProps) => {
  sonnerToast(title, {
    description,
    duration,
  });
};

toast.success = (message: string, options?: ToastProps) => {
  sonnerToast.success(message, options);
};

toast.error = (message: string, options?: ToastProps) => {
  sonnerToast.error(message, options);
};

toast.warning = (message: string, options?: ToastProps) => {
  sonnerToast.warning(message, options);
};

toast.info = (message: string, options?: ToastProps) => {
  sonnerToast.info(message, options);
};

toast.dismiss = (toastId?: string) => {
  sonnerToast.dismiss(toastId);
};
