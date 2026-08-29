import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talab | طلب",
  description: "بوابتك البسيطة لطلب الخدمات ومتابعة التحديثات",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
