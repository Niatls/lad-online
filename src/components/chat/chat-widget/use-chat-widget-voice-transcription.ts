"use client";

import { useEffect, useRef } from "react";

type SpeechRecognitionEventResult = {
  0: { transcript: string };
  isFinal: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionEventResult[];
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type UseChatWidgetVoiceTranscriptionParams = {
  isRecordingVoice: boolean;
  setVoiceTranscript: React.Dispatch<React.SetStateAction<string>>;
  voiceDraftExists: boolean;
};

function resolveSpeechRecognition() {
  if (typeof window === "undefined") {
    return null;
  }

  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function useChatWidgetVoiceTranscription({
  isRecordingVoice,
  setVoiceTranscript,
  voiceDraftExists,
}: UseChatWidgetVoiceTranscriptionParams) {
  const finalTranscriptRef = useRef("");
  const latestTranscriptRef = useRef("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (!isRecordingVoice) {
      if (latestTranscriptRef.current) {
        finalTranscriptRef.current = latestTranscriptRef.current;
      }
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      return;
    }

    const SpeechRecognition = resolveSpeechRecognition();
    if (!SpeechRecognition) {
      return;
    }

    if (!voiceDraftExists) {
      finalTranscriptRef.current = "";
      latestTranscriptRef.current = "";
      setVoiceTranscript("");
    }

    let active = true;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ru-RU";
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? "";

        if (result?.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${transcript}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim();
        }
      }

      const nextTranscript = `${finalTranscriptRef.current} ${interimTranscript}`.trim();
      latestTranscriptRef.current = nextTranscript;
      setVoiceTranscript(nextTranscript);
    };

    recognition.onerror = () => {
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      if (latestTranscriptRef.current) {
        finalTranscriptRef.current = latestTranscriptRef.current;
      }
      recognitionRef.current = null;
      if (active && isRecordingVoice) {
        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch {
          recognitionRef.current = null;
        }
      }
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
    }

    return () => {
      active = false;
      if (latestTranscriptRef.current) {
        finalTranscriptRef.current = latestTranscriptRef.current;
      }
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.stop();
    };
  }, [isRecordingVoice, setVoiceTranscript, voiceDraftExists]);
}
