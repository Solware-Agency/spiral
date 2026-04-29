import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoPicture from '../../../components/LogoPicture';
import { LOGO_SIZES, SPIRAL_LOGO_PNG, SPIRAL_LOGO_SLUG } from '../../../data/logoSources';
import styles from '../styles/home.module.css';

const navLeft = ['HOME', 'SERVICES', 'PORTFOLIO', 'ABOUT'];
const navRight = ['THE STUDIO', 'BOOK NOW', 'CONTACT US'];

const CONTACT_PORTAL_URL =
  'https://spiralstudio.hbportal.co/public/66343620b1546100287cdd19';

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
  if (key === 'contact-us') return CONTACT_PORTAL_URL;
  return `/#${key}`;
};

const isExternalFooterHref = (to) => /^https?:\/\//i.test(to);

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
            <p className={styles.footerLabel}>NAVIGATION</p>
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
                {navRight.map((item) => {
                  const to = sectionHref(item);
                  return (
                    <li key={item}>
                      {isExternalFooterHref(to) ? (
                        <a href={to} target="_blank" rel="noreferrer">
                          {item}
                        </a>
                      ) : (
                        <Link to={to}>{item}</Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
          <div className={styles.footerColCenter}>
            <Link to="/" aria-label="Spiral home" onClick={scrollTopIfAlreadyHome('/')}>
              <LogoPicture
                slug={SPIRAL_LOGO_SLUG.fullWhite}
                pngSrc={SPIRAL_LOGO_PNG.fullWhite}
                className={styles.footerLogoImage}
                alt="SPIRAL Marketing Studio"
                width={736}
                height={325}
                sizes={LOGO_SIZES.footer}
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>
          <div className={`${styles.footerCol} ${styles.footerColRight}`}>
            <p className={styles.footerLabel}>{"LET'S CONNECT!"}</p>
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
