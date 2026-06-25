import { Literata, Nunito_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  weight: ["300", "400", "500", "600", "700", "800", "900", "1000"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "The Herbal Veda",
  description: "Experience Nature's Finest Selection",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${literata.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
