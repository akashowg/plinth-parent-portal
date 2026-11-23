import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/inter";
import "@fontsource/jost/500.css";
import "@fontsource/noto-sans-devanagari/400.css";
import "@fontsource/noto-sans-devanagari/600.css";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import LangSwitch from "@/components/LangSwitch";
import HdiLockup from "@/components/HdiLockup";

export const metadata: Metadata = {
  title: "PLINTH HDI · Parent Portal · a PLINTH Network initiative",
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
          <a href="/" className="brand" aria-label="PLINTH HDI — home">
            <HdiLockup height={52} />
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
          <div className="foot-grid">
            <div className="endorse">
              <span className="endorse-label">{t(lang, "initiative")}</span>
              <img src="/plinth-logo-lockup-navy.svg" alt="PLINTH Network" width={109} height={36} />
            </div>
            <div className="foot-text">
              <p>{t(lang, "footerNote")}</p>
              <p>
                <a href="/privacy">{t(lang, "privacy")}</a> · © PLINTH Network {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
