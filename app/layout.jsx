import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Grizzle | Premium DTF Printing & Custom Printed Apparel',
  description: 'High-density DTF printed t-shirts, bio-washed 240 GSM heavy cotton tees, custom anime graphics, desi typography, and vibrant DTF prints.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
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
      </body>
    </html>
  );
}
