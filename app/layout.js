import { Lato, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-body",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-heading",
});

export const metadata = {
  title: "RakaRituals",
  description: "E-commerce platform",
};

// eslint-disable-next-line react/prop-types
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lato.variable} ${cormorant.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="bg-primary-background text-text font-sans antialiased overflow-x-hidden relative" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {/* ATMOSPHERIC OVERLAYS */}
            <div className="grain-overlay"></div>
            <div className="ambient-light"></div>
            
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
