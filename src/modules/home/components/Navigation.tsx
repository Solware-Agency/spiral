import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoPicture from '../../../components/LogoPicture';
import { LOGO_SIZES, SPIRAL_LOGO_PNG, SPIRAL_LOGO_SLUG } from '../../../data/logoSources';
import styles from '../styles/home.module.css';

const leftLinks = ['Home', 'Services', 'Portfolio', 'About'];
const rightLinks = ['The Studio', 'Book Now', 'Contact Us'];

const CONTACT_PORTAL_URL =
  'https://spiralstudio.hbportal.co/public/66343620b1546100287cdd19';

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
  if (item === 'Contact Us') return CONTACT_PORTAL_URL;
  return sectionLinkTo(item);
};

const isExternalNavHref = (to) => /^https?:\/\//i.test(to);

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let rafId = 0;
    const update = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const next = window.scrollY > 10;
        setIsScrolled((prev) => (prev === next ? prev : next));
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
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
          <span className={styles.hamburgerIcon} aria-hidden="true">
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </span>
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
          <LogoPicture
            slug={SPIRAL_LOGO_SLUG.fullWhite}
            pngSrc={SPIRAL_LOGO_PNG.fullWhite}
            className={styles.logoImage}
            alt="SPIRAL Marketing Studio"
            sizes={LOGO_SIZES.nav}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </Link>
        <ul className={styles.navRight}>
          {rightLinks.map((item) => {
            const to = rightLinkTo(item);
            return (
              <li key={item}>
                {isExternalNavHref(to) ? (
                  <a href={to} target="_blank" rel="noreferrer">
                    {item}
                  </a>
                ) : (
                  <Link to={to}>{item}</Link>
                )}
              </li>
            );
          })}
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
              {isExternalNavHref(to) ? (
                <a
                  href={to}
                  className={styles.mobileMenuLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMenu}
                >
                  {label}
                </a>
              ) : (
                <Link to={to} className={styles.mobileMenuLink} onClick={onMobileLinkClick(to)}>
                  {label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </header>
  );
};

export default Navigation;
