"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";

type VoiceCallBoundaryProps = {
  children: ReactNode;
  onClose: () => void;
  onReset?: () => void;
};

type VoiceCallBoundaryState = {
  hasError: boolean;
};

export class VoiceCallBoundary extends Component<VoiceCallBoundaryProps, VoiceCallBoundaryState> {
  state: VoiceCallBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Voice call UI crashed:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xl p-6 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-red-50 text-red-500 flex items-center justify-center shadow-[0_24px_60px_rgba(239,68,68,0.12)] mb-6">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-forest/35 mb-3">Voice Mode</p>
          <h4 className="text-2xl font-bold text-forest tracking-tight mb-2">Сбой voice-режима</h4>
          <p className="text-sm text-forest/55 max-w-xs leading-relaxed">
            Голосовая панель столкнулась с ошибкой. Чат продолжает работать, можно закрыть звонок или попробовать открыть его снова.
          </p>
        </div>

        <div className="rounded-[2rem] border border-sage-light/20 bg-cream/40 p-4 flex items-center justify-center gap-4">
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-forest border border-sage-light/20 shadow-sm transition hover:bg-sage-light/10"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            Попробовать снова
          </button>
          <button
            onClick={this.props.onClose}
            className="inline-flex items-center gap-2 rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90"
            type="button"
          >
            <X className="h-4 w-4" />
            Закрыть
          </button>
        </div>
      </div>
    );
  }
}
