'use client';

import React from 'react';
import { HardDrive, Settings, ShieldCheck, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Settings className="h-5 w-5 text-blue-400" />
            <h2 className="font-semibold text-zinc-100">應用程式設定</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
              <HardDrive className="h-4 w-4 text-emerald-400" />
              開源本機模式
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              不需帳號、密碼或外部資料庫；資料只保存在這個瀏覽器的 localStorage。
            </p>
          </div>
          <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5 text-amber-100/80">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p>瀏覽器資料不是雲端備份。清除網站資料、改用其他瀏覽器或裝置前，請先確認重要紀錄已有備份。</p>
          </div>
        </div>
      </div>
    </div>
  );
};
