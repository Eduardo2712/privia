"use client";

import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { AlertProvider } from "../contexts/AlertContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Provider store={store}>
                    <AlertProvider>{children}</AlertProvider>
                </Provider>
            </body>
        </html>
    );
}
