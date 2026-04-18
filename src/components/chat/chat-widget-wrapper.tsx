"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/chat/chat-widget";
import { useChatWidgetNativeAndroidShell } from "@/components/chat/chat-widget/use-chat-widget-native-android-shell";

export function ChatWidgetWrapper() {
  const pathname = usePathname();
  const isNativeAndroid = useChatWidgetNativeAndroidShell();

  // Don't show chat on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <ChatWidget nativeShell={isNativeAndroid} />;
}
