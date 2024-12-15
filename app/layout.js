import './globals.css';
import styles from './layout.module.css';
import Link from 'next/link';

export const metadata = {
  title: 'ScanToPrint - Print Documents Easily',
  description: 'Upload, scan, and print your documents with just a few clicks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <Link href="/" className={styles.logo}>
              ScanToPrint
            </Link>
            <div className={styles.navLinks}>
              <Link href="/features">Features</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/store/login" className={styles.loginButton}>
                Store Login
              </Link>
            </div>
          </div>
        </nav>

        {children}

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h3>ScanToPrint</h3>
              <p>Making printing easier for everyone</p>
            </div>
            <div className={styles.footerSection}>
              <h3>Quick Links</h3>
              <Link href="/features">Features</Link>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/#how-it-works">How It Works</Link>
            </div>
            <div className={styles.footerSection}>
              <h3>For Businesses</h3>
              <Link href="/store/register">Register Store</Link>
              <Link href="/store/login">Store Login</Link>
            </div>
            <div className={styles.footerSection}>
              <h3>Contact Us</h3>
              <p>sohailnadaf66@gmail.com</p>
              <p>+91 8050594245</p>
              <p>JCER, Belagavi</p>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} ScanToPrint. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
