import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { ChatWidget } from "@/components/ai/ChatWidget";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bullobuild.com"),
  title: "BULLOBUILD | Professional Tools. Trusted Brands.",
  description:
    "Authorized distributor of DeWalt, Milwaukee, Craftsman, Stanley, Black+Decker, Snap-on, Mac Tools, Kobalt, Skil, and Proto. Shop new and pre-owned professional tools.",
  icons: {
    icon: "/favicon.png?v=yellow",
    shortcut: "/favicon.png?v=yellow",
    apple: "/favicon.png?v=yellow",
  },
  keywords: [
    "professional tools",
    "DeWalt",
    "Milwaukee",
    "Mac Tools",
    "tool marketplace",
    "authorized distributor",
  ],
  openGraph: {
    title: "BULLOBUILD",
    description: "Authorized distributor of top professional tool brands.",
    type: "website",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} h-full`}
    >
      <body className="bg-[#070f1c] text-white min-h-full flex flex-col antialiased">
        <Header />
        <CartDrawer />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              background: "#0B1F3A",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "13px",
            },
            success: { iconTheme: { primary: "#F2B705", secondary: "#0B1F3A" } },
          }}
        />
      </body>
    </html>
  );
}
