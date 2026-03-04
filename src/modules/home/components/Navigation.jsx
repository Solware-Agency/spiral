import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/home.module.css';

const leftLinks = ['Home', 'Services', 'Portfolio', 'About'];
const rightLinks = ['The Studio', 'Book Now', 'Contact Us'];

const SPIRAL_LOGO_WHITE =
  '/images/spiral%20logos/SPIRAL%20Logos/Full/Spiral-logo-white.png';

const leftLinkTo = (item) => {
  const key = item.toLowerCase().replace(' ', '-');
  if (key === 'home') return '/';
  if (key === 'services') return '/services';
  if (key === 'portfolio') return '/portfolio';
  if (key === 'about') return '/about';
  return `/#${key}`;
};

const sectionLinkTo = (item) => `/#${item.toLowerCase().replace(/\s+/g, '-')}`;
const rightLinkTo = (item) => {
  if (item === 'The Studio') return '/studio';
  if (item === 'Book Now') return '/book-now';
  return sectionLinkTo(item);
};

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 10);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return () => {};
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    // Lock page scroll when drawer is open.
    if (!isMenuOpen) {
      document.body.style.overflow = '';
      return () => {};
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  useEffect(() => {
    // Close drawer on navigation.
    setIsMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    // Close mobile drawer when switching to desktop breakpoint.
    const onResize = () => {
      if (window.innerWidth > 900) setIsMenuOpen(false);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scrollTopIfAlreadyHome = (to) => (e) => {
    if (to !== '/') return;
    if (location.pathname === '/' && !location.hash) {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  const mobileLinks = useMemo(
    () => [
      ...leftLinks.map((label) => ({ label, to: leftLinkTo(label) })),
      ...rightLinks.map((label) => ({ label, to: rightLinkTo(label) })),
    ],
    []
  );

  const closeMenu = () => setIsMenuOpen(false);
  const openMenu = () => setIsMenuOpen(true);

  const onMobileLinkClick = (to) => (e) => {
    scrollTopIfAlreadyHome(to)(e);
    closeMenu();
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
      <nav className={styles.nav}>
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={openMenu}
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-drawer"
        >
          MENU
        </button>

        <ul className={styles.navLeft}>
          {leftLinks.map((item) => (
            <li key={item}>
              <Link to={leftLinkTo(item)} onClick={scrollTopIfAlreadyHome(leftLinkTo(item))}>
                {item}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to="/"
          className={styles.logoBlock}
          aria-label="Spiral home"
          onClick={scrollTopIfAlreadyHome('/')}
        >
          <img
            className={styles.logoImage}
            src={SPIRAL_LOGO_WHITE}
            alt="SPIRAL Marketing Studio"
            loading="eager"
            decoding="async"
          />
        </Link>
        <ul className={styles.navRight}>
          {rightLinks.map((item) => (
            <li key={item}>
              <Link to={rightLinkTo(item)}>{item}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.mobileMenuOverlayOpen : ''}`}
        aria-hidden={!isMenuOpen}
        onClick={closeMenu}
      />
      <aside
        id="mobile-nav-drawer"
        className={`${styles.mobileMenuPanel} ${isMenuOpen ? styles.mobileMenuPanelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>NAVIGATION</span>
          <button
            type="button"
            className={styles.mobileMenuClose}
            onClick={closeMenu}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        <ul className={styles.mobileMenuList}>
          {mobileLinks.map(({ label, to }) => (
            <li key={`${label}-${to}`} className={styles.mobileMenuItem}>
              <Link to={to} className={styles.mobileMenuLink} onClick={onMobileLinkClick(to)}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </header>
  );
};

export default Navigation;
