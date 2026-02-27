import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeurLearn - AI-Powered Engineering Learning Platform",
  description: "Your personal AI mentor for engineering mastery. Experience adaptive, personalized learning with intelligent AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
