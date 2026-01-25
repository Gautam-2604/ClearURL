import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearURL | AI-Powered URL Safety Scanner",
  description: "Verify any link before you click. Instantly detect phishing, malware, and suspicious elements with AI-powered analysis. Get a clear safety verdict.",
  keywords: ["url scanner", "link checker", "phishing detection", "website safety", "security scanner", "malware detection", "AI security"],
  authors: [{ name: "ClearURL" }],
  openGraph: {
    title: "ClearURL | AI-Powered URL Safety Scanner",
    description: "Verify any link before you click. Instantly detect phishing and malware with AI-powered analysis.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearURL | AI-Powered URL Safety Scanner",
    description: "Verify any link before you click. Instantly detect phishing and malware with AI-powered analysis.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Background orbs for ambient lighting effect */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </div>
        {children}
      </body>
    </html>
  );
}
