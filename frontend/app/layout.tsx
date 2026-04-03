import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Burnout Sentinel",
  description: "An early warning system for student burnout using workload and recovery indicators."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
