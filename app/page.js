import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Print Documents Seamlessly</h1>
          <p>Upload, scan, and print your documents with just a few clicks</p>
          <div className={styles.heroCta}>
            <Link href="/customer/scan" className={styles.primaryButton}>
              Print Now
            </Link>
            <Link href="/store/login" className={styles.secondaryButton}>
              Store Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features">
        <h2>Why Choose Us</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚀</div>
            <h3>Quick & Easy</h3>
            <p>Upload your files and get them printed within minutes</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔒</div>
            <h3>Secure</h3>
            <p>Your documents are encrypted and securely handled</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>✨</div>
            <h3>Free</h3>
            <p>No hidden charges, completely free to use</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📍</div>
            <h3>Convenient</h3>
            <p>Multiple store locations to serve you better</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.about} id="about">
        <div className={styles.aboutContent}>
          <h2>About Us</h2>
          <p>
            We're a student-led initiative based in JCER, Belagavi, revolutionizing the way you print documents. 
            Our platform connects you with local print shops, making document printing hassle-free and efficient. 
            Whether you're a student rushing to print assignments or a professional needing quick prints, 
            we've got you covered with our free and easy-to-use service.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2>How It Works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <h3>Scan QR Code</h3>
            <p>Find a nearby store and scan their unique QR code</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <h3>Upload Files</h3>
            <p>Upload your documents and select print preferences</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <h3>Collect Prints</h3>
            <p>Pick up your prints from the store</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contact} id="contact">
        <h2>Contact Us</h2>
        <div className={styles.contactContent}>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <h3>Email</h3>
              <p>sohailnadaf66@gmail.com</p>
            </div>
            <div className={styles.contactItem}>
              <h3>Phone</h3>
              <p>+91 8050594245</p>
            </div>
            <div className={styles.contactItem}>
              <h3>Address</h3>
              <p>JCER, Belagavi, Karnataka, 590001</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
