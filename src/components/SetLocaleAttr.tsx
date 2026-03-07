"use client";

import { useEffect } from "react";

export default function SetLocaleAttr({ locale }: { locale: string }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  return null;
}
