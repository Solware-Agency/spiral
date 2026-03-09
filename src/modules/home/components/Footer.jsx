import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const sectionHref = (item) => {
  const key = item.toLowerCase().replace(/\s+/g, '-');
  if (key === 'the-studio') return '/studio';
  if (key === 'book-now') return '/book-now';
  return `/#${key}`;
};

const Footer = () => {
  const location = useLocation();

  const scrollTopIfAlreadyHome = (to) => (e) => {
    if (to !== '/') return;
    if (location.pathname === '/' && !location.hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

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
                    <Link to={leftHref(item)} onClick={scrollTopIfAlreadyHome(leftHref(item))}>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
              <ol className={`${styles.footerNav} ${styles.footerNavQuick}`}>
                {navRight.map((item) => (
                  <li key={item}>
                    <Link to={sectionHref(item)}>{item}</Link>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className={styles.footerColCenter}>
            <Link to="/" aria-label="Spiral home" onClick={scrollTopIfAlreadyHome('/')}>
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
              href="https://mail.google.com/mail/?view=cm&fs=1&to=andrea%40spiralmstudio.com"
              target="_blank"
              rel="noreferrer"
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
