import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const faqKeys = [
  { q: "faq1q", a: "faq1a" },
  { q: "faq2q", a: "faq2a" },
  { q: "faq3q", a: "faq3a" },
  { q: "faq4q", a: "faq4a" },
  { q: "faq5q", a: "faq5a" },
  { q: "faq6q", a: "faq6a" },
  { q: "faq7q", a: "faq7a" },
];

export default async function SupportPage() {
  const t = await getTranslations("support");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 text-white/60">{t("subtitle")}</p>
      </div>

      <div id="guide" className="rounded-2xl border border-white/10 bg-card p-6 scroll-mt-6">
        <h2 className="text-lg font-semibold text-white">{t("faqTitle")}</h2>
        <ul className="mt-4 space-y-6">
          {faqKeys.map((item, i) => (
            <li key={i} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
              <p className="font-medium text-white">{t(item.q)}</p>
              <p className="mt-2 text-sm text-white/70">{t(item.a)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h3 className="font-semibold text-white">{t("guideTitle")}</h3>
          <p className="mt-2 text-sm text-white/70">{t("guideDesc")}</p>
          <Link
            href="#guide"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-accent-hover"
          >
            {t("seeGuide")}
            <span>→</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h3 className="font-semibold text-white">{t("contactUs")}</h3>
          <p className="mt-2 text-sm text-white/70">{t("contactDesc")}</p>
          <a
            href="mailto:formio.forms@gmail.com"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10"
          >
            formio.forms@gmail.com
          </a>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h3 className="font-semibold text-white">{t("conditions")}</h3>
          <p className="mt-2 text-sm text-white/70">{t("conditionsDesc")}</p>
          <Link
            href="/conditions-generales"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10"
          >
            {t("conditionsLink")}
            <span>→</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card p-6">
          <h3 className="font-semibold text-white">{t("privacy")}</h3>
          <p className="mt-2 text-sm text-white/70">{t("privacyDesc")}</p>
          <Link
            href="/confidentialite"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10"
          >
            {t("privacyLink")}
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
