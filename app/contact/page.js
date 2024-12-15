import styles from './page.module.css';

export default function Contact() {
  return (
    <main className={styles.main}>
      <section className={styles.header}>
        <h1>Contact Us</h1>
        <p>Get in touch with us for any questions or support</p>
      </section>

      <div className={styles.contactContainer}>
        <section className={styles.contactInfo}>
          <h2>Contact Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📧</div>
              <h3>Email</h3>
              <p>sohailnadaf66@gmail.com</p>
              <p className={styles.responseTime}>We usually respond within 24 hours</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📱</div>
              <h3>Phone</h3>
              <p>+91 8050594245</p>
              <p className={styles.responseTime}>Available Mon-Fri, 9am-6pm IST</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>📍</div>
              <h3>Address</h3>
              <p>JCER, Belagavi</p>
              <p>Karnataka, 590001</p>
              <p>India</p>
            </div>
          </div>
        </section>

        <section className={styles.contactForm}>
          <h2>Send us a Message</h2>
          <form className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Subject of your message"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Your message"
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className={styles.submitButton}>
              Send Message
            </button>
          </form>
        </section>
      </div>

      <section className={styles.faq}>
        <h2>Frequently Asked Questions</h2>
        <div className={styles.faqGrid}>
          <div className={styles.faqItem}>
            <h3>How does ScanToPrint work?</h3>
            <p>Simply scan the QR code at any participating store, upload your documents, and collect your prints!</p>
          </div>
          <div className={styles.faqItem}>
            <h3>Is the service really free?</h3>
            <p>Yes, our platform is completely free to use. You only pay for the actual printing costs at the store.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>What file types are supported?</h3>
            <p>We support most common file types including PDF, DOC, DOCX, JPG, PNG, and more.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>How long are my files stored?</h3>
            <p>Files are automatically deleted after printing or after 24 hours, whichever comes first.</p>
          </div>
        </div>
      </section>
    </main>
  );
} 