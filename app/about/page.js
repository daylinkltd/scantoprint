import styles from './page.module.css';

export default function About() {
  return (
    <main className={styles.main}>
      <section className={styles.header}>
        <h1>About ScanToPrint</h1>
        <p>A student-led initiative revolutionizing document printing</p>
      </section>

      <section className={styles.story}>
        <div className={styles.storyContent}>
          <h2>Our Story</h2>
          <p>
            ScanToPrint was born from a simple observation at JCER, Belagavi: students needed a better way to print their documents. 
            We noticed the daily struggles of rushing to print shops, waiting in long queues, and dealing with file transfer hassles. 
            That's when we decided to create a solution that would make printing as easy as scanning a QR code.
          </p>
        </div>
      </section>

      <section className={styles.mission}>
        <div className={styles.missionContent}>
          <h2>Our Mission</h2>
          <p>
            Our mission is to simplify document printing for everyone in our community. We believe that technology 
            should make everyday tasks easier, not more complicated. By connecting students and local print shops 
            through our platform, we're creating a seamless printing experience that saves time and reduces stress.
          </p>
        </div>
      </section>

      <section className={styles.values}>
        <h2>Our Values</h2>
        <div className={styles.valueGrid}>
          <div className={styles.valueCard}>
            <h3>Simplicity</h3>
            <p>We believe in making things as simple and straightforward as possible</p>
          </div>
          <div className={styles.valueCard}>
            <h3>Innovation</h3>
            <p>Constantly improving our service to better serve our community</p>
          </div>
          <div className={styles.valueCard}>
            <h3>Accessibility</h3>
            <p>Making printing services easily accessible to everyone</p>
          </div>
          <div className={styles.valueCard}>
            <h3>Community</h3>
            <p>Building strong relationships with local businesses and users</p>
          </div>
        </div>
      </section>

      <section className={styles.location}>
        <h2>Our Location</h2>
        <div className={styles.locationContent}>
          <div className={styles.locationInfo}>
            <h3>JCER Campus</h3>
            <p>JCER, Belagavi</p>
            <p>Karnataka, 590001</p>
            <p>India</p>
          </div>
          <div className={styles.locationMap}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7677.400628206846!2d74.48335514590235!3d15.819748389296603!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbf65fce1db9ac3%3A0x272a8426898e54a2!2sJGI%20-%20Jain%20College%20Of%20Engineering%20And%20Research!5e0!3m2!1sen!2sin!4v1734254253201!5m2!1sen!2sin"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
} 