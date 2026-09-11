import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Uche Fashion International",
  description: "Ready-to-wear and made-to-order pieces rooted in Nigerian craft.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ivory text-ink">
        {children}
      </body>
    </html>
  );
}
