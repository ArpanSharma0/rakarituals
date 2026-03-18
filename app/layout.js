import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "RakaRituals",
  description: "E-commerce platform",
};

// eslint-disable-next-line react/prop-types
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-primary-background text-text font-sans antialiased overflow-x-hidden relative">
        {/* ATMOSPHERIC OVERLAYS */}
        <div className="grain-overlay"></div>
        <div className="ambient-light"></div>
        
        {children}
      </body>
    </html>
  );
}
