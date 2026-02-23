import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/home.module.css';

const navLeft = ['HOME', 'SERVICES', 'PORTFOLIO', 'ABOUT'];
const navRight = ['THE STUDIO', 'BOOK NOW', 'CONTACT US'];

const SPIRAL_LOGO_WHITE =
  '/images/spiral%20logos/SPIRAL%20Logos/Full/Spiral-logo-white.png';

const leftHref = (item) => {
  const key = item.toLowerCase().replace(/\s+/g, '-');
  if (key === 'home') return '/';
  if (key === 'services') return '/services';
  if (key === 'portfolio') return '/portfolio';
  if (key === 'about') return '/about';
  return `/#${key}`;
};

const sectionHref = (item) => `/#${item.toLowerCase().replace(/\s+/g, '-')}`;

const Footer = () => {
  return (
    <footer id="contact-us" className={styles.footer}>
      <div id="book-now" aria-hidden />
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <h3 className={styles.footerLabel}>NAVIGATION</h3>
            <div className={styles.footerNavGrid}>
              <ul className={styles.footerNav}>
                {navLeft.map((item) => (
                  <li key={item}>
                    <Link to={leftHref(item)}>{item}</Link>
                  </li>
                ))}
              </ul>
              <ul className={styles.footerNav}>
                {navRight.map((item) => (
                  <li key={item}>
                    <Link to={sectionHref(item)}>{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.footerColCenter}>
            <Link to="/" aria-label="Spiral home">
              <img
                className={styles.footerLogoImage}
                src={SPIRAL_LOGO_WHITE}
                alt="SPIRAL Marketing Studio"
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>
          <div className={`${styles.footerCol} ${styles.footerColRight}`}>
            <h3 className={styles.footerLabel}>LETS CONNECT!</h3>
            <div className={styles.footerConnectLinks}>
              <a
                href="https://www.instagram.com/spiral.mstudio/"
                className={styles.footerLink}
                target="_blank"
                rel="noreferrer"
              >
                INSTAGRAM
              </a>
              <a
                href="https://www.tiktok.com/@spiral.mstudio"
                className={styles.footerLink}
                target="_blank"
                rel="noreferrer"
              >
                TIKTOK
              </a>
            </div>
            <a
              className={styles.footerEmail}
              href="mailto:andrea@spiralmstudio.com"
            >
              ANDREA@SPIRALMSTUDIO.COM
            </a>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          © 2025 SPIRAL MARKETING STUDIO. ALL rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
