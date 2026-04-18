import { Loader2, Radio } from "lucide-react";

import { MONTHLY_CAP_BYTES } from "./constants";

type VoiceInfoPanelProps = {
  connecting: boolean;
  durationLabel: string;
  error: string | null;
  iceRoute: string;
  isReconnecting: boolean;
  lastEvent: string;
  role: "admin" | "visitor";
  status: string;
  title: string;
  trafficRouteLabel: string;
  usageBytes: number;
  usageLabel: string;
};

export function VoiceInfoPanel({
  connecting,
  durationLabel,
  error,
  iceRoute,
  isReconnecting,
  lastEvent,
  role,
  status,
  title,
  trafficRouteLabel,
  usageBytes,
  usageLabel,
}: VoiceInfoPanelProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 rounded-full bg-forest text-white flex items-center justify-center shadow-[0_24px_60px_rgba(45,63,45,0.18)] mb-6">
        {connecting ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : (
          <Radio className="h-10 w-10" />
        )}
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-forest/35 mb-3">
        Voice Mode
      </p>
      <h4 className="text-2xl font-bold text-forest tracking-tight mb-2">
        {title}
      </h4>
      <p className="text-sm text-forest/55 max-w-xs leading-relaxed">
        {error ?? status}
      </p>
      {isReconnecting ? (
        <div className="mt-3 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
          Восстанавливаем соединение...
        </div>
      ) : null}

      <div className="mt-8 w-full max-w-sm rounded-[2rem] border border-sage-light/20 bg-cream/35 p-4 text-left shadow-sm">
        {role === "admin" ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">
                Длительность
              </p>
              <p className="mt-1 text-base font-bold text-forest">
                {durationLabel}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">
                Трафик
              </p>
              <p className="mt-1 text-base font-bold text-forest">
                {usageLabel}
              </p>
              <p className="mt-1 text-[11px] text-forest/45">
                {((usageBytes / MONTHLY_CAP_BYTES) * 100).toFixed(4)}% из 1000 GB
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">
              Общая длительность
            </p>
            <p className="mt-1 text-base font-bold text-forest">
              {durationLabel}
            </p>
            <p className="mt-1 text-[11px] text-forest/45">
              Пауза ставится автоматически, если связь временно прерывается.
            </p>
          </div>
        )}
        {role === "admin" ? (
          <>
            <div className="mt-3 rounded-[1.25rem] bg-white/80 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">
                Маршрут трафика
              </p>
              <p className="mt-1 text-sm font-medium text-forest">
                {trafficRouteLabel}
              </p>
            </div>
            <div className="mt-3 rounded-[1.25rem] bg-white/80 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">
                ICE Route
              </p>
              <p className="mt-1 text-sm font-medium text-forest break-all">
                {iceRoute}
              </p>
            </div>
          </>
        ) : null}
        <div className="mt-3 rounded-[1.25rem] bg-white/80 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">
            Последний статус
          </p>
          <p className="mt-1 text-sm font-medium text-forest">{lastEvent}</p>
        </div>
      </div>
    </div>
  );
}
