import React, { createContext, useState, useCallback, ReactNode, useContext, useEffect } from "react";
import { ConfirmationModal } from "./ConfirmationModal";

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "success" | "warning" | "danger" | "info";
  onConfirm?: () => Promise<void> | void;
}

export interface ConfirmationContextType {
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>;
}

export const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

type ConfirmationShowFunction = (options: ConfirmationOptions) => Promise<boolean>;
let globalShowConfirmation: ConfirmationShowFunction | null = null;

export const showGlobalConfirmation = (options: ConfirmationOptions): Promise<boolean> => {
  if (globalShowConfirmation) {
    return globalShowConfirmation(options);
  }
  console.warn("showGlobalConfirmation called before ConfirmationProvider was initialized");
  return Promise.resolve(false);
};

interface ConfirmationState extends ConfirmationOptions {
  visible: boolean;
  loading: boolean;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmationProviderProps {
  children: ReactNode;
}

const defaultState: ConfirmationState = {
  visible: false,
  loading: false,
  title: "",
  message: "",
  confirmText: "Konfirmasi",
  cancelText: undefined,
  variant: "info",
  resolve: null,
};

export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({ children }) => {
  const [state, setState] = useState<ConfirmationState>(defaultState);

  const showConfirmation = useCallback((options: ConfirmationOptions) => {
    if (state.visible) {
      return Promise.resolve(false);
    }

    return new Promise<boolean>((resolve) => {
      setState({
        visible: true,
        loading: false,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || "Konfirmasi",
        cancelText: options.cancelText,
        variant: options.variant || "info",
        onConfirm: options.onConfirm,
        resolve,
      });
    });
  }, [state.visible]);

  // Set global reference
  useEffect(() => {
    globalShowConfirmation = showConfirmation;
    return () => {
      globalShowConfirmation = null;
    };
  }, [showConfirmation]);

  const handleConfirm = useCallback(async () => {
    if (state.loading) return;
    
    if (state.onConfirm) {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        await state.onConfirm();
        if (state.resolve) state.resolve(true);
        setState(defaultState);
      } catch (error) {
        console.error("Async confirmation callback failed:", error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    } else {
      if (state.resolve) state.resolve(true);
      setState(defaultState);
    }
  }, [state]);

  const handleCancel = useCallback(() => {
    if (state.loading) return;
    if (state.resolve) state.resolve(false);
    setState(defaultState);
  }, [state]);

  return (
    <ConfirmationContext.Provider value={{ showConfirmation }}>
      {children}
      <ConfirmationModal
        visible={state.visible}
        loading={state.loading}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText || "Konfirmasi"}
        cancelText={state.cancelText}
        variant={state.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};
