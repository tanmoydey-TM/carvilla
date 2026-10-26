import "./globals.css";

export const metadata = {
  title: "Car Villa — Beyond the Ordinary",
  description: "Enter Car Villa. A cinematic journey through automotive character, sculpted performance, and quiet luxury. Discover the art of the drive.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
