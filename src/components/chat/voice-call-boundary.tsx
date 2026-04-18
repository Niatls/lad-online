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

export class VoiceCallBoundary extends Component<
  VoiceCallBoundaryProps,
  VoiceCallBoundaryState
> {
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
      <div className="absolute inset-0 z-20 flex flex-col bg-white/95 p-6 backdrop-blur-xl">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500 shadow-[0_24px_60px_rgba(239,68,68,0.12)]">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-forest/35">
            Voice Mode
          </p>
          <h4 className="mb-2 text-2xl font-bold tracking-tight text-forest">
            Сбой voice-режима
          </h4>
          <p className="max-w-xs text-sm leading-relaxed text-forest/55">
            Голосовая панель столкнулась с ошибкой. Чат продолжает работать:
            можно закрыть звонок или попробовать открыть его снова.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 rounded-[2rem] border border-sage-light/20 bg-cream/40 p-4">
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-sage-light/20 bg-white px-4 py-3 text-sm font-bold text-forest shadow-sm transition hover:bg-sage-light/10"
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
