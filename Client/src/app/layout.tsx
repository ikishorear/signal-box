import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { FriendsProvider } from "@/components/friends-provider"
import { ProjectsProvider } from "@/components/projects-provider"


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Signal Box",
  description: "Platform to catch signals and put threads for it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className={`${geistSans.className} min-h-full flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider>
          <TooltipProvider>
            <FriendsProvider>
              <ProjectsProvider>
                {children}
                <Toaster />
              </ProjectsProvider>
            </FriendsProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
