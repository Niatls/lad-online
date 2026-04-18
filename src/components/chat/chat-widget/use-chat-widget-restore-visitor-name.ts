import { useEffect } from "react";

import { getStoredVisitorName } from "@/components/chat/chat-widget/utils";

type UseChatWidgetRestoreVisitorNameParams = {
  setPendingVisitorName: React.Dispatch<React.SetStateAction<string>>;
  setVisitorName: React.Dispatch<React.SetStateAction<string>>;
};

export function useChatWidgetRestoreVisitorName({
  setPendingVisitorName,
  setVisitorName,
}: UseChatWidgetRestoreVisitorNameParams) {
  useEffect(() => {
    const storedName = getStoredVisitorName();
    setVisitorName(storedName);
    setPendingVisitorName(storedName);
  }, [setPendingVisitorName, setVisitorName]);
}
