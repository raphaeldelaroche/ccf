"use client";

import { Mail, X } from "lucide-react";

interface BenchmarkNotificationProps {
  onClose: () => void;
  onClick: () => void;
}

export function BenchmarkNotification({ onClose, onClick }: BenchmarkNotificationProps) {
  return (
    <div
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 animate-in slide-in-from-right-full duration-500 cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-background border-2 border-border rounded-xl p-5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold">CCF Benchmark</p>
              <p className="text-xs text-muted-foreground">Just now</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="pl-[52px]">
          <p className="text-sm font-medium">
            Your climate contribution potential is ready
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click to view your personalised result
          </p>
        </div>
      </div>
    </div>
  );
}
