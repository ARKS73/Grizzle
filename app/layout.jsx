import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingActions from '@/components/ui/FloatingActions';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'Grizzle | Premium DTF Printing & Custom Printed Apparel',
  description: 'High-density DTF printed t-shirts, bio-washed 240 GSM heavy cotton tees, custom anime graphics, desi typography, and vibrant DTF prints.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ThemeProvider>
                  <Navbar />
                  <main className="main-layout">{children}</main>
                  <Footer />
                </ThemeProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
