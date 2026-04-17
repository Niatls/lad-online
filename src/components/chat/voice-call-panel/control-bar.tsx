import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";

type VoiceControlBarProps = {
  muted: boolean;
  onEnd: () => void;
  onToggleMute: () => void;
};

export function VoiceControlBar({
  muted,
  onEnd,
  onToggleMute,
}: VoiceControlBarProps) {
  return (
    <div className="rounded-[2rem] border border-sage-light/20 bg-cream/40 p-4 flex items-center justify-center gap-4">
      <button
        onClick={onToggleMute}
        className="h-14 w-14 rounded-full bg-white text-forest border border-sage-light/20 shadow-sm flex items-center justify-center transition hover:bg-sage-light/10"
        type="button"
      >
        {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </button>
      <button
        onClick={onEnd}
        className="h-16 w-16 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20 flex items-center justify-center transition hover:bg-red-600"
        type="button"
      >
        <PhoneOff className="h-7 w-7" />
      </button>
      <div className="h-14 w-14 rounded-full bg-forest/10 text-forest flex items-center justify-center">
        <Phone className="h-6 w-6" />
      </div>
    </div>
  );
}
