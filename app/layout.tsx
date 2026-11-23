import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/inter";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/600.css";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import LangSwitch from "@/components/LangSwitch";

export const metadata: Metadata = {
  title: "PLINTH HDI · Parent Portal",
  description: "Consent and intake for the PLINTH Human Development Intelligence dossier.",
  robots: { index: false, follow: false },
  icons: { icon: "/plinth-logo-icon-navy.svg" },
};

export const viewport: Viewport = { themeColor: "#0D2344", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body>
        <header className="site-head">
          <a href="/" className="brand" aria-label="PLINTH Network — home">
            <img src="/plinth-logo-lockup-navy.svg" alt="PLINTH Network" width={132} height={44} />
          </a>
          <div className="head-right">
            <span className="portal-label">{t(lang, "portal")}</span>
            <Suspense fallback={null}>
              <LangSwitch to={lang === "hi" ? "en" : "hi"} label={t(lang, "switchTo")} />
            </Suspense>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-foot">
          <div className="rule" />
          <p>{t(lang, "footerNote")}</p>
          <p>
            <a href="/privacy">{t(lang, "privacy")}</a> · © PLINTH Network {new Date().getFullYear()}
          </p>
        </footer>
      </body>
    </html>
  );
}
