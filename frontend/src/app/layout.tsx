import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kworkforge — Freelance xizmatlar markazi",
  description: "Minglab freelance xizmatlari ichidan keraklisini tanlang, xavfsiz buyurtma bering va ish jarayonini bir joyda kuzating.",
};

const darkReaderCleanup = `
(function() {
  if (typeof window === 'undefined') return;
  function cleanDarkReader() {
    document.querySelectorAll('[data-darkreader-inline-stroke]').forEach(function(el) {
      el.removeAttribute('data-darkreader-inline-stroke');
      if (el.style && el.style.getPropertyValue('--darkreader-inline-stroke')) {
        el.style.removeProperty('--darkreader-inline-stroke');
      }
    });
    document.querySelectorAll('[data-darkreader-mode]').forEach(function(el) {
      el.removeAttribute('data-darkreader-mode');
      el.removeAttribute('data-darkreader-scheme');
      el.removeAttribute('data-darkreader-proxy-injected');
    });
  }
  cleanDarkReader();
  new MutationObserver(cleanDarkReader).observe(document.documentElement, { childList: true, subtree: true, attributes: true });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} h-full antialiased dark`} suppressHydrationWarning>
      <head>
        <Script id="dark-reader-cleanup" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: darkReaderCleanup }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <TooltipProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
