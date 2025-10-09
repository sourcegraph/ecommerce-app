import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'error' | 'success' | 'info';

interface Toast {
  readonly id: string;
  readonly message: string;
  readonly type: ToastType;
}

interface ToastContextValue {
  readonly showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  readonly children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): React.JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType): void => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const getToastStyles = (type: ToastType): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      padding: '1rem 1.5rem',
      borderRadius: '0.375rem',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    };

    switch (type) {
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: '#1A1919',
          color: '#FAF9F6',
        };
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: '#1A1919',
          color: '#FAF9F6',
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: '#3E3D3B',
          color: '#FAF9F6',
        };
    }
  };

  const toastContainer = (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            ...getToastStyles(toast.type),
            pointerEvents: 'auto',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
