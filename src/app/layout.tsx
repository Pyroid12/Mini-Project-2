import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerBuddy AI - Your AI-Powered Career Companion",
  description:
    "AI-powered career and placement preparation platform for engineering students. Access curated career roadmaps, resume analysis, developer analytics, and personalized placement readiness tracking.",
  keywords: [
    "CareerBuddy AI",
    "placement preparation",
    "engineering placements",
    "career roadmap",
    "resume analysis",
    "developer analytics",
    "mock interview",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try {
                  var theme = localStorage.getItem('careerbuddy_theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (theme === 'system' && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    if (document.body) document.body.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    if (document.body) document.body.classList.remove('dark');
                  }
                } catch (e) {}
              `,
            }}
          />
        </head>
        <body
          suppressHydrationWarning
          className="min-h-full flex flex-col bg-[#F8FAFC] text-[#172033]"
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
