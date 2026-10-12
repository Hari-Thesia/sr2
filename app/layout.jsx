import "./globals.css";
import { Cormorant_Garamond, Manrope } from "next/font/google";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "The Lake Side by SR Group | Villa Plots in Sanand, Gujarat",
  description:
    "Interactive master plan of The Lake Side — 95 villa plots around a natural lake in Sanand. Check live plot availability.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
