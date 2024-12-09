import './globals.css';

export const metadata = {
  title: 'ScanToPrint - Digital Print Management System',
  description: 'Streamline your printing experience with digital file management. Upload documents via QR code and manage print orders efficiently.',
  keywords: 'print management, digital printing, QR code printing, document management, print store',
  authors: [{ name: 'ScanToPrint' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0070f3',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://scantoprint.vercel.app',
    title: 'ScanToPrint - Digital Print Management System',
    description: 'Streamline your printing experience with digital file management. Upload documents via QR code and manage print orders efficiently.',
    siteName: 'ScanToPrint',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'ScanToPrint Preview',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScanToPrint - Digital Print Management System',
    description: 'Streamline your printing experience with digital file management',
    images: ['/twitter-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
