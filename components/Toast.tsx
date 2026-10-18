'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200 ${
            t.type === 'success'
              ? 'bg-zinc-900 border-emerald-500/40 text-emerald-300'
              : t.type === 'error'
              ? 'bg-zinc-900 border-red-500/40 text-red-300'
              : t.type === 'warning'
              ? 'bg-zinc-900 border-amber-500/40 text-amber-300'
              : 'bg-zinc-900 border-blue-500/40 text-blue-300'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            {t.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-zinc-100">{t.title}</div>
            {t.message && <div className="text-zinc-400 mt-0.5 leading-relaxed">{t.message}</div>}
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="text-zinc-500 hover:text-zinc-300 transition -mr-1 -mt-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
