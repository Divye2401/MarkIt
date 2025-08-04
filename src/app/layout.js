import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "../utils/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"], // choose weights
  variable: "--font-poppins", // create CSS variable
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistMono.variable}  ${geistSans.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>{" "}
        {/* This wraps the app with React Query context */}
      </body>
    </html>
  );
}
