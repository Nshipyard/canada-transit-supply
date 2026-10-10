import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";
import { PosthogProvider } from "../components/PosthogProvider";

const SITE_URL = "https://supply.canada.nshipyard.com";
const TITLE = "Canada Transit Supply: what got built near the stations";
const DESCRIPTION =
  "125 Toronto rail stations joined to 2,314 development projects within 800 metres. 41.1% of pipeline homes sit near an open station; Finch West went from 0 to 4 projects after its 2017 opening. Station explorer, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.";
const SHARE_DESCRIPTION =
  "125 Toronto rail stations joined to 2,314 development projects within 800 metres. 41.1% of pipeline homes sit near an open station; Finch West went from 0 to 4 projects after its 2017 opening.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: TITLE,
    description: SHARE_DESCRIPTION,
    url: `${SITE_URL}/`,
    siteName: "Canada Transit Supply",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SHARE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      "/favicon.ico",
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col"><PosthogProvider>
        <LangProvider>{children}</LangProvider>
      </PosthogProvider></body>
    </html>
  );
}
