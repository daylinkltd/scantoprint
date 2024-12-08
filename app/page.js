import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>ScanToPrint</h1>
        <p className={styles.description}>
          Streamline your printing experience with digital file management
        </p>

        <div className={styles.grid}>
          <Link href="/store/register" className={styles.card}>
            <h2>Store Owner &rarr;</h2>
            <p>Register your store and manage print orders efficiently</p>
          </Link>

          <Link href="/customer/scan" className={styles.card}>
            <h2>Customer &rarr;</h2>
            <p>Scan store QR code and upload your documents for printing</p>
          </Link>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>ScanToPrint - Making printing easier for everyone</p>
      </footer>
    </div>
  );
}
