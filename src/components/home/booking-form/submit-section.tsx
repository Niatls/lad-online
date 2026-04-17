import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

type SubmitSectionProps = {
  isSubmitting: boolean;
  submitError: string;
};

export function SubmitSection({
  isSubmitting,
  submitError,
}: SubmitSectionProps) {
  return (
    <>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl border-0 bg-gradient-to-r from-sage to-sage-dark text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-sage-dark hover:to-forest hover:shadow-xl"
      >
        {isSubmitting ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Отправить заявку
      </Button>

      {submitError ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <p className="text-center text-xs leading-relaxed text-forest/30">
        Нажимая кнопку, вы соглашаетесь с правилами нашего сервиса. Ваши данные
        защищены в соответствии с ФЗ-152.
      </p>
    </>
  );
}
