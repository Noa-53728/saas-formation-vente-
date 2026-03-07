import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import SetLocaleAttr from "@/components/SetLocaleAttr";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const currentLocale = await getLocale();

  return (
    <NextIntlClientProvider messages={messages} locale={currentLocale}>
      <SetLocaleAttr locale={currentLocale} />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Header />
        <main>{children}</main>
      </div>
    </NextIntlClientProvider>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
