import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";

export const metadata: Metadata = {
  title: "Canada Transit Supply: what got built near the stations",
  description:
    "125 Toronto rail stations joined to 2,314 development projects within 800 metres. 41.1% of pipeline homes sit near an open station; Finch West went from 0 to 4 projects after its 2017 opening. Station explorer, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
