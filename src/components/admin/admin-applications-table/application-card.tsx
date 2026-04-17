import type { Application } from "@prisma/client";

import {
  formatApplicationDate,
  formatApplicationGender,
  formatApplicationNumber,
  formatPreferredTime,
  getApplicationContactMethod,
} from "@/lib/applications";

import { ApplicationInfoRow } from "./info-row";
import { ApplicationStatusCell } from "./status-cell";
import { formatSourceLabel, normalizeOptionalValue } from "./utils";

type ApplicationCardProps = {
  application: Application;
};

export function ApplicationCard({ application }: ApplicationCardProps) {
  const phone = normalizeOptionalValue(application.phone);
  const email = normalizeOptionalValue(application.email);
  const contactValue = normalizeOptionalValue(application.contactValue);
  const reason =
    normalizeOptionalValue(application.reason) ||
    "\u041f\u0440\u0438\u0447\u0438\u043d\u0430 \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d\u0430";
  const contactMethod = getApplicationContactMethod(application.contactMethod);
  const applicationCode = formatApplicationNumber(
    application.id,
    application.verificationCode
  );

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-sage-light/20 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sage/30 hover:shadow-xl">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-sage-light/35 via-cream to-transparent" />

      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sage-dark">
              {formatSourceLabel(application.source)}
            </p>
            <div>
              <h3 className="text-xl font-bold text-forest">
                {application.name}
              </h3>
              <p className="mt-1 text-sm text-forest/55">
                {formatApplicationGender(application.gender)}
                {application.age ? `, ${application.age} \u043b\u0435\u0442` : ""}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-sage-light/20 bg-white/90 px-4 py-3 text-right shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/35">
              {"\u041d\u043e\u043c\u0435\u0440"}
            </p>
            <p className="mt-2 text-sm font-semibold text-forest">
              {applicationCode}
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-sage-light/15 bg-cream/70 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/35">
            {"\u041f\u0440\u0438\u0447\u0438\u043d\u0430 \u043e\u0431\u0440\u0430\u0449\u0435\u043d\u0438\u044f"}
          </p>
          <p className="mt-3 text-sm leading-7 text-forest/80">{reason}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ApplicationInfoRow
            label={"\u0417\u0430\u043f\u0438\u0441\u044c"}
            value={formatPreferredTime(application.preferredTime)}
          />
          <ApplicationInfoRow
            label={"\u041a\u0430\u043d\u0430\u043b \u0441\u0432\u044f\u0437\u0438"}
            value={contactMethod.label}
          />
          <ApplicationInfoRow
            label={"\u0422\u0435\u043b\u0435\u0444\u043e\u043d"}
            value={phone || "\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d"}
          />
          <ApplicationInfoRow
            label="Email"
            value={email || "\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d"}
          />
          <ApplicationInfoRow
            label={"\u041b\u043e\u0433\u0438\u043d / \u0430\u0434\u0440\u0435\u0441"}
            value={contactValue || "\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d"}
          />
          <ApplicationInfoRow
            label={"\u0421\u043e\u0437\u0434\u0430\u043d\u0430"}
            value={formatApplicationDate(application.createdAt)}
          />
        </div>

        <div className="rounded-[1.5rem] border border-sage-light/15 bg-white/80 p-5">
          <ApplicationStatusCell application={application} />
        </div>
      </div>
    </article>
  );
}
