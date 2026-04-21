import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthListener } from "@/components/auth-listener";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const plex = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://maximpulso.com.br";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8E7" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1A12" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mentor Empreendedor | Max Impulso",
    template: "%s | Max Impulso",
  },
  description:
    "Seu mentor virtual de negócios para microempreendedores brasileiros. Tire dúvidas sobre MEI, precificação, vendas e muito mais.",
  applicationName: "Max Impulso",
  keywords: [
    "MEI",
    "microempreendedor",
    "mentor de negócios",
    "empreendedorismo",
    "Simples Nacional",
    "precificação",
    "vendas online",
  ],
  authors: [{ name: "Max Impulso" }],
  creator: "Max Impulso",
  publisher: "Max Impulso",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    title: "Mentor Empreendedor | Max Impulso",
    description:
      "Seu mentor virtual de negócios para microempreendedores brasileiros.",
    siteName: "Max Impulso",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentor Empreendedor | Max Impulso",
    description:
      "Seu mentor virtual de negócios para microempreendedores brasileiros.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${bricolage.variable} ${plex.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthListener />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
