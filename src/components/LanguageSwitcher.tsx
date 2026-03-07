"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/25 bg-white/10 p-1">
      <span className="px-2 text-xs text-white/60">{t("language")}</span>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            locale === loc
              ? "bg-white/20 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
