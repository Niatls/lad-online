"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/chat/chat-widget";
import { useChatWidgetNativeMobileShell } from "@/components/chat/chat-widget/use-chat-widget-native-mobile-shell";

export function ChatWidgetWrapper() {
  const pathname = usePathname();
  const isNativeMobile = useChatWidgetNativeMobileShell();

  // Don't show chat on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <ChatWidget nativeShell={isNativeMobile} />;
}
