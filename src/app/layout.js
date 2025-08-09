import { Geist_Mono } from "next/font/google";
import { Nunito } from "next/font/google";
import "./globals.css";
import QueryProvider from "../utils/Providers/QueryProvider"; //providdes query object to all components
import AuthProvider from "../utils/Providers/AuthProvider"; //provides auth listener to all components
import ThemeProvider from "../utils/Providers/ThemeProvider"; //provides theme context to all components
import { Toaster } from "sonner";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Regular, Medium, SemiBold, Bold
  variable: "--font-nunito",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
