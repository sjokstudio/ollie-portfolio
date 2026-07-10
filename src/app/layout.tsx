import type { Metadata } from "next";
import { Inter, Fraunces, Caveat, Fira_Code } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
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
  title: "Ollie. | AI Crypto Music",
  description: "Ollie 的个人入口。AI、Crypto、Music、数字难民，常驻 X。",
};

const themeBootScript = `(()=>{try{const k='ollieos-theme';const m=localStorage.getItem(k)||'system';const d=m==='system'?matchMedia('(prefers-color-scheme: dark)').matches:m==='dark';const t=d?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.dataset.themeMode=m;document.documentElement.style.colorScheme=t}catch{document.documentElement.dataset.theme='dark'}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${caveat.variable} ${firaCode.variable} h-full antialiased`}
    >
      <head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head>
      <body className="h-full flex flex-col m-0 p-0 overflow-x-hidden text-foreground bg-background">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
