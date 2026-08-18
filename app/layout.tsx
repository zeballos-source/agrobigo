import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agro Bigo — Catálogo de maquinaria agrícola",
  description: "Catálogo digital de Agro Bigo S.R.L. — Río Cuarto (Córdoba) y Santa Rosa de Conlara (San Luis).",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;800;900&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
