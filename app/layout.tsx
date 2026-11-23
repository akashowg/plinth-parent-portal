import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource/spectral/300.css";
import "@fontsource/spectral/400.css";
import "@fontsource/ibm-plex-sans-devanagari/400.css";
import "@fontsource/ibm-plex-sans-devanagari/600.css";
import "@fontsource/jost/500.css";
import "@fontsource/noto-sans-bengali/400.css";
import "@fontsource/noto-sans-bengali/600.css";
import "@fontsource/noto-sans-telugu/400.css";
import "@fontsource/noto-sans-telugu/600.css";
import "@fontsource/noto-sans-tamil/400.css";
import "@fontsource/noto-sans-tamil/600.css";
import "@fontsource/noto-sans-gujarati/400.css";
import "@fontsource/noto-sans-gujarati/600.css";
import "@fontsource/noto-sans-kannada/400.css";
import "@fontsource/noto-sans-kannada/600.css";
import "@fontsource/noto-sans-oriya/400.css";
import "@fontsource/noto-sans-oriya/600.css";
import "@fontsource/noto-sans-malayalam/400.css";
import "@fontsource/noto-sans-malayalam/600.css";
import "@fontsource/noto-nastaliq-urdu/400.css";
import "@fontsource/noto-nastaliq-urdu/600.css";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { langInfo } from "@/lib/i18n/langs";
import LangSwitch from "@/components/LangSwitch";
import HdiLockup from "@/components/HdiLockup";

export const metadata: Metadata = {
  title: "PLINTH HDI · Parent Portal · a PLINTH Network initiative",
  description:
    "Consent and intake for the PLINTH Human Development Intelligence dossier.",
  robots: { index: false, follow: false },
  icons: { icon: "/plinth-logo-icon-navy.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0D2344",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={langInfo(lang).dir}>
      <body>
        <header className="site-head">
          <div className="head-inner">
            <a href="/" className="brand" aria-label="PLINTH HDI — home">
              <HdiLockup height={46} />
            </a>
            <div className="head-right">
              <span className="portal-label">{t(lang, "portal")}</span>
              <Suspense fallback={null}>
                <LangSwitch current={lang} label={t(lang, "language")} />
              </Suspense>
            </div>
          </div>
        </header>
        {lang !== "en" && lang !== "hi" && (
          <p className="trans-note">{t(lang, "translationNote")}</p>
        )}
        <main className="site-main">{children}</main>
        <footer className="site-foot">
          <div className="rule" />
          <div className="foot-grid">
            <div className="endorse">
              <span className="endorse-label">{t(lang, "initiative")}</span>
              <img
                src="/plinth-network-horizontal-navy.svg"
                alt="PLINTH Network"
                width={148}
                height={32}
              />
            </div>
            <div className="foot-text">
              <p>{t(lang, "footerNote")}</p>
              <p>
                <a href="/privacy">{t(lang, "privacy")}</a> · © PLINTH Network{" "}
                {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
