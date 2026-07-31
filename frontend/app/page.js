'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      {/* Animated Background */}
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <div className={styles.logoMark}>K</div>
          <span className={styles.logoName}>Katips</span>
        </div>
        <nav className={styles.headerNav}>
          <Link href="/login" className={`btn btn-ghost ${styles.loginBtn}`}>Log In</Link>
          <Link href="/register" className={`btn btn-primary ${styles.signupBtn}`}>Get Started</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🏛️ Sangguniang Kabataan Digital Platform</div>
          <h1 className={styles.heroTitle}>
            Your <span className="gradient-text">Katipunan</span><br />Central Hub
          </h1>
          <p className={styles.heroDesc}>
            Connect, engage, and grow with your community. Access services, join events, earn rewards, and stay updated — all in one platform built for the youth.
          </p>
          <div className={styles.heroCta}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Join Katips Today →
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg">
              Explore Features
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>500+</span>
              <span className={styles.statLabel}>Youth Members</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>50+</span>
              <span className={styles.statLabel}>Events Hosted</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>10K+</span>
              <span className={styles.statLabel}>Points Earned</span>
            </div>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardHeader}>
              <div className={styles.dots}><span/><span/><span/></div>
            </div>
            <div className={styles.heroCardContent}>
              <div className={styles.miniNav}>
                <div className={styles.miniNavItem}>🏠</div>
                <div className={`${styles.miniNavItem} ${styles.miniNavActive}`}>💬</div>
                <div className={styles.miniNavItem}>📰</div>
                <div className={styles.miniNavItem}>🛠️</div>
                <div className={styles.miniNavItem}>🚀</div>
              </div>
              <div className={styles.miniPost}>
                <div className={styles.miniAvatar}>J</div>
                <div className={styles.miniPostContent}>
                  <div className={styles.miniPostTitle}>Basketball Tournament</div>
                  <div className={styles.miniPostText}>Registration is now open! 🏀</div>
                  <div className={styles.miniPostMeta}>
                    <span>❤️ 24</span>
                    <span>💬 8</span>
                  </div>
                </div>
              </div>
              <div className={styles.miniPost}>
                <div className={styles.miniAvatar} style={{background: 'linear-gradient(135deg, #F472B6, #A78BFA)'}}>M</div>
                <div className={styles.miniPostContent}>
                  <div className={styles.miniPostTitle}>Free Coding Workshop</div>
                  <div className={styles.miniPostText}>This Saturday, 9AM! 💻</div>
                  <div className={styles.miniPostMeta}>
                    <span>❤️ 42</span>
                    <span>💬 15</span>
                  </div>
                </div>
              </div>
              <div className={styles.miniPoints}>
                <span>🏆</span>
                <span>320 pts</span>
                <div className={styles.miniPointsBar}><div className={styles.miniPointsFill}/></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features} id="features">
        <h2 className={styles.sectionTitle}>Everything You Need, <span className="gradient-text">In One Place</span></h2>
        <p className={styles.sectionDesc}>Katips brings together all SK services and community tools into a single, beautiful platform.</p>
        <div className={styles.featureGrid}>
          {[
            { icon: '💬', title: 'Community Forum', desc: 'Connect and discuss with fellow youth. Share ideas, ask questions, and engage with your community.' },
            { icon: '📰', title: 'News & Events', desc: 'Stay updated with the latest SK announcements, activities, and community events.' },
            { icon: '🛠️', title: 'Services Hub', desc: 'Access printing services, gym reservations, court bookings, and more with just a few clicks.' },
            { icon: '🚀', title: 'SKill Up', desc: 'Join events, earn points, climb the leaderboard, and redeem exciting rewards.' },
            { icon: '📋', title: 'Transparency Board', desc: 'View financial reports, SK resolutions, and meeting minutes. Full transparency, always.' },
            { icon: '🔔', title: 'Notifications', desc: 'Never miss important updates. Get notified about forum replies, event reminders, and more.' },
          ].map((f, i) => (
            <div key={i} className={`glass-card ${styles.featureCard}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={`${styles.ctaCard} gradient-bg`}>
          <h2 className={styles.ctaTitle}>Ready to Join the Community?</h2>
          <p className={styles.ctaDesc}>Sign up now and start earning points, accessing services, and connecting with fellow youth in Katipunan.</p>
          <Link href="/register" className={`btn ${styles.ctaBtn}`}>
            Create Your Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.logoMark}>K</div>
            <div>
              <div className={styles.footerTitle}>Katips</div>
              <div className={styles.footerSub}>Katipunan Central Hub</div>
            </div>
          </div>
          <p className={styles.footerCopy}>© 2026 Sangguniang Kabataan — Katipunan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
