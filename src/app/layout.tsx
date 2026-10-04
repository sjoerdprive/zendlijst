import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/shared/i18n";
import { getDictionary, getLocale } from "@/shared/i18n/server";
import { InstallPrompt, ServiceWorkerRegistrar } from "@/shared/pwa";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6ee" },
    { media: "(prefers-color-scheme: dark)", color: "#11141c" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return {
    title: t.meta.title,
    description: t.meta.description,
    applicationName: t.meta.title,
    appleWebApp: { capable: true, title: t.meta.title, statusBarStyle: "default" },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <I18nProvider locale={locale}>
          {children}
          <InstallPrompt />
        </I18nProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
