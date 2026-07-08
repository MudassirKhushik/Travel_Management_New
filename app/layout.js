// app/layout.js - THIS IS THE ONLY ONE YOU NEED
import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}