import { MessageCircle } from "lucide-react";

type ChatWidgetEmptyMessagesProps = {
  visitorName: string;
};

export function ChatWidgetEmptyMessages({ visitorName }: ChatWidgetEmptyMessagesProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 flex h-20 w-20 rotate-12 items-center justify-center rounded-[2rem] bg-sage/10 transition-transform duration-500 hover:rotate-0">
        <MessageCircle className="h-10 w-10 text-sage" />
      </div>
      <h4 className="mb-2 text-xl font-bold text-forest">
        Привет, {visitorName || "друг"}!
      </h4>
      <p className="max-w-[240px] text-sm leading-relaxed text-forest/50">
        Мы уже рядом на случай, если захочется задать вопрос. Напишите первое сообщение, и специалист
        подключится, как только освободится.
      </p>
    </div>
  );
}
