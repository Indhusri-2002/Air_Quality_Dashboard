"use client";

import 'bootstrap/dist/css/bootstrap.css';
import { Inter } from "next/font/google";
import { useEffect } from 'react';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        { 
          useEffect(() => {
            import("bootstrap");
          }, [])
        }
      </body>
    </html>
  );
}
