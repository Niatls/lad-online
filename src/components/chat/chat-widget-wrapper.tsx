"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "@/components/chat/chat-widget";

export function ChatWidgetWrapper() {
  const pathname = usePathname();

  // Don't show chat on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <ChatWidget />;
}
