import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Emmanuel Uche Global",
  description: "Ready-to-wear and made-to-order pieces rooted in Nigerian craft.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${montserrat.variable} ${cormorant.variable}`}>
      <body className="min-h-full flex flex-col bg-ivory text-ink">
        {children}
      </body>
    </html>
  );
}

