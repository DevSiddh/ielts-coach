import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";

export const metadata = {
  title: "IELTS Coach",
  description: "A speaking-first IELTS coach with transcript review, band-style feedback, and voice playback.",
  applicationName: "IELTS Coach",
  appleWebApp: {
    capable: true,
    title: "IELTS Coach",
    statusBarStyle: "black-translucent"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05070d"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="topbar app-topbar">
            <Link className="brand" href="/">
              <span className="brand-mark" />
              <span>
                IELTS Coach
                <small>Speaking console</small>
              </span>
            </Link>
            <SiteNav />
          </header>
          {children}
          <footer className="footer app-footer">Scoring-first speaking practice with raw transcript evidence.</footer>
        </div>
      </body>
    </html>
  );
}
