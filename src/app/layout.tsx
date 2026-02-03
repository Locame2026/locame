import type { Metadata } from "next";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";

export const metadata: Metadata = {
    title: "LOCAME - Encuentra tu menú del día",
    description: "Geolocaliza los mejores restaurantes cerca de ti.",
    icons: {
        icon: "/icon.jpg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Anton&family=Dancing+Script:wght@700&family=Outfit:wght@300;400;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                {children}
                <CookieConsent />
            </body>
        </html>
    );
}
