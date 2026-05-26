import { Lato, Cormorant_Garamond, Questrial, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { SocketProvider } from "@/context/SocketContext";
import { WishlistProvider } from "@/context/WishlistContext";

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

const questrial = Questrial({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading-mobile",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata = {
  title: "RakaRituals",
  description: "E-commerce platform",
  icons: {
    icon: "/assets/images/raka_favicon.png?v=1",
  },
};

// eslint-disable-next-line react/prop-types
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lato.variable} ${cormorant.variable} ${questrial.variable} ${inter.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="bg-primary-background text-text font-sans antialiased overflow-x-hidden relative" suppressHydrationWarning>
        <AuthProvider>
          <WishlistProvider>
            <SocketProvider>
              <CartProvider>
                {/* ATMOSPHERIC OVERLAYS */}
                <div className="grain-overlay"></div>
                <div className="ambient-light"></div>
                
                {children}
              </CartProvider>
            </SocketProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
