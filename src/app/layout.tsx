import type { Metadata } from "next";
import { Inter, Fraunces, Caveat, Fira_Code } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-noto-sans", // Keeping the variable name same so globals.css doesn't break
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Researcher & Music Producer",
  description: "Personal OS Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${fraunces.variable} ${caveat.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col m-0 p-0 overflow-x-hidden text-foreground bg-background">{children}</body>
    </html>
  );
}

