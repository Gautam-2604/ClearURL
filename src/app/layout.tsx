import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Link Checker | URL Safety Scanner",
  description: "Analyze the legitimacy of any URL by inspecting pages, outbound links, meta tags, redirects, and hidden elements. Get a clear, explainable safety verdict.",
  keywords: ["link checker", "URL scanner", "phishing detection", "website safety", "security scanner"],
  authors: [{ name: "Link Checker" }],
  openGraph: {
    title: "Link Checker | URL Safety Scanner",
    description: "Analyze the legitimacy of any URL and get a clear safety verdict.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Link Checker | URL Safety Scanner",
    description: "Analyze the legitimacy of any URL and get a clear safety verdict.",
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
