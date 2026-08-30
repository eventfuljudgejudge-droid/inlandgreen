import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Inland Green Bank";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "Secure, modern banking — manage your accounts, transfer money, and track your finances.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
              borderRadius: 12,
              padding: "14px 18px",
              fontSize: 14,
              fontWeight: 500,
            },
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
