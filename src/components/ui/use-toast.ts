
// This file re-exports the toast hook for backwards compatibility
import { useToast } from "@/hooks/use-toast";

// Re-export the hook
export { useToast };

// Re-export a simpler interface for standard usage
export const toast = {
  // We need to access the toast from the hook when it's used in a component
  success: (message: string, options = {}) => {
    if (typeof window !== 'undefined') {
      // This will be populated at runtime when used within components
      return message;
    }
    return message;
  },
  error: (message: string, options = {}) => {
    if (typeof window !== 'undefined') {
      return message;
    }
    return message;
  },
  warning: (message: string, options = {}) => {
    if (typeof window !== 'undefined') {
      return message;
    }
    return message;
  },
  info: (message: string, options = {}) => {
    if (typeof window !== 'undefined') {
      return message;
    }
    return message;
  },
  dismiss: () => {},
  dismissAll: () => {}
};
