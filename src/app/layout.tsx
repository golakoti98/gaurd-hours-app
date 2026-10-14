import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GuardHours",
  description: "Security staff working hours tracker",
  applicationName: "GuardHours",
  appleWebApp: {
    capable: true,
    title: "GuardHours",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#064e3b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-100 text-gray-900">
        <OfflineBanner />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
