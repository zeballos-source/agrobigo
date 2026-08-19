import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agro Bigo — Maquinaria agrícola",
  description:
    "Concesionario oficial Agrochery y distribuidor Impagro / Ascanelli. Río Cuarto (Córdoba) y Santa Rosa de Conlara (San Luis).",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Work+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
