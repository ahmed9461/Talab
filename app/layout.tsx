import type { Metadata, Viewport } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const font = Noto_Sans_Arabic({ subsets: ["arabic"], display: "swap", variable: "--font-arabic" });

export const metadata: Metadata = {
  title: { default: "طلب | Talab", template: "%s | طلب" },
  description: "بوابة طلب لمتابعة الخدمات والطلبات والإشعارات من مكان واحد.",
  applicationName: "Talab",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#163b8c" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body className={font.variable}>{children}</body></html>;
}
