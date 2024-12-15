import styles from './page.module.css';

export default function Features() {
  return (
    <main className={styles.main}>
      <section className={styles.header}>
        <h1>Our Features</h1>
        <p>Discover what makes ScanToPrint the best choice for your printing needs</p>
      </section>

      <section className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🚀</div>
          <div className={styles.featureContent}>
            <h2>Quick & Easy</h2>
            <p>Our streamlined process ensures you can get your documents printed in minutes:</p>
            <ul>
              <li>Simple QR code scanning</li>
              <li>Intuitive file upload interface</li>
              <li>Quick processing time</li>
              <li>Instant order confirmation</li>
            </ul>
          </div>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔒</div>
          <div className={styles.featureContent}>
            <h2>Secure</h2>
            <p>Your documents' security is our top priority:</p>
            <ul>
              <li>End-to-end encryption</li>
              <li>Secure file transfer</li>
              <li>Automatic file deletion after printing</li>
              <li>Private and confidential handling</li>
            </ul>
          </div>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>✨</div>
          <div className={styles.featureContent}>
            <h2>Free Service</h2>
            <p>We believe in making printing accessible to everyone:</p>
            <ul>
              <li>No subscription fees</li>
              <li>No hidden charges</li>
              <li>Pay only for your prints</li>
              <li>Transparent pricing at stores</li>
            </ul>
          </div>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>📍</div>
          <div className={styles.featureContent}>
            <h2>Convenient</h2>
            <p>Print from anywhere, anytime:</p>
            <ul>
              <li>Multiple store locations</li>
              <li>24/7 online access</li>
              <li>Mobile-friendly interface</li>
              <li>No software installation needed</li>
            </ul>
          </div>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>📱</div>
          <div className={styles.featureContent}>
            <h2>Mobile First</h2>
            <p>Designed for the modern user:</p>
            <ul>
              <li>Responsive design</li>
              <li>Works on all devices</li>
              <li>Easy mobile uploads</li>
              <li>Quick QR code scanning</li>
            </ul>
          </div>
        </div>

        <div className={styles.feature}>
          <div className={styles.featureIcon}>🎯</div>
          <div className={styles.featureContent}>
            <h2>Print Options</h2>
            <p>Customize your prints:</p>
            <ul>
              <li>Multiple paper sizes</li>
              <li>Color and B&W options</li>
              <li>Single/Double sided</li>
              <li>Various paper qualities</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
} 