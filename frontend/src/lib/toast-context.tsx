"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, AlertCircle, CheckCircle, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    error: <AlertCircle size={16} className="shrink-0 text-red-400" />,
    success: <CheckCircle size={16} className="shrink-0 text-green-400" />,
    info: <Info size={16} className="shrink-0 text-blue-400" />,
  };

  const barColors = {
    error: "bg-red-400",
    success: "bg-green-400",
    info: "bg-blue-400",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-20 right-4 z-[60] grid gap-2.5 w-[min(380px,calc(100vw-36px))]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`relative overflow-hidden rounded-xl border backdrop-blur-md shadow-2xl ${
                t.type === "error"
                  ? "border-red-500/40 bg-red-950/95"
                  : t.type === "success"
                    ? "border-green-500/40 bg-green-950/95"
                    : "border-white/15 bg-neutral-900/95"
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                {icons[t.type]}
                <span className="flex-1 leading-snug text-sm text-white">{t.message}</span>
                <button onClick={() => dismiss(t.id)} className="shrink-0 p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-white transition">
                  <X size={14} />
                </button>
              </div>
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3.5, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${barColors[t.type]}`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
