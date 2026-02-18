import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Summer Ball Portal",
  description: "Summer Ball Portal V1",
};

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}