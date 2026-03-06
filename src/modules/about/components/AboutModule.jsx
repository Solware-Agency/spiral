import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/about.module.css';
import ClientMarquee from './ClientMarquee';
import InstagramGrid from '../../home/components/InstagramGrid';

const AboutModule = () => {
  return (
    <section className={styles.about}>
      <section className={styles.hero} aria-label="About hero">
        <div className={styles.heroOverlay} aria-hidden />

        <div className={styles.heroMonogram} aria-hidden>
          <img
            className={styles.monogramIcon}
            src="/images/spiral%20logos/SPIRAL%20Logos/Icon/Spiral-Icon-White.png"
            alt=""
            loading="eager"
            decoding="async"
          />
        </div>

        <div className={styles.heroInner}>
          <p className={styles.heroKicker}>WE ARE SPIRAL</p>
        </div>
      </section>

      <section className={styles.specializeWrap}>
        <div className={styles.specializeInner}>
          <div className={styles.specializeGrid}>
            <div className={styles.specializeCopy}>
              <p className={styles.label}>WHAT WE SPECIALIZE IN</p>

              <p className={styles.lead}>
                Spiral was created for brands that break the rules. For those who
                want to be <strong>seen</strong>, heard, and{' '}
                <strong>remembered</strong>. We work with businesses that aren’t
                afraid to push boundaries, own their story, and make their mark
                in bold, <strong>authentic</strong> ways.
              </p>

              <p className={styles.body}>
                We specialize in social media management, content creation, and
                graphic design, offering a la carte and customizable packages to
                fit every brand’s unique needs. Whether you want to be hands-on
                or step back and let us manage it all, making sure your brand is
                seen, heard, and remembered.
              </p>

              <Link to="/#contact-us" className={styles.cta}>
                WORK WITH US
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.specializePolaroid} aria-hidden="true">
          <svg
            className={styles.specializePolaroidSvg}
            viewBox="0 0 1000 1000"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <clipPath id="specializePhotoWindow">
                <rect x="160" y="210" width="680" height="490" rx="8" ry="8" />
              </clipPath>

              {/* Hide the “gray window” part of the PNG frame so the photo shows through. */}
              <mask id="specializePolaroidFrameMask" maskUnits="userSpaceOnUse">
                <rect x="0" y="0" width="1000" height="1000" fill="white" />
                <rect x="164" y="214" width="672" height="482" rx="8" ry="8" fill="black" />
              </mask>
            </defs>

            <image
              href="/images/photos/DSC09031.jpg"
              x="160"
              y="210"
              width="680"
              height="490"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#specializePhotoWindow)"
              style={{
                filter: 'grayscale(75%) contrast(1.05)',
              }}
            />

            <image
              href="/images/photos/polaroid.png"
              x="0"
              y="0"
              width="1000"
              height="1000"
              preserveAspectRatio="xMidYMid meet"
              mask="url(#specializePolaroidFrameMask)"
            />
          </svg>
        </div>
      </section>

      <section className={styles.founderSection} aria-label="Founder">
        <div className={styles.founderGrid}>
          <div className={styles.founderPhotoWrap}>
            <img
              className={styles.founderPhoto}
              src="/images/photos/IMG_9072.JPG"
              alt="Andrea Suarez"
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className={styles.founderContent}>
            <p className={styles.founderKicker}>MEET THE FOUNDER</p>
            <h2 className={styles.founderName}>ANDREA SUAREZ</h2>

            <div className={styles.founderText}>
              <p>Hi there,</p>
              <p>
                Spiral was born from a love of bold ideas and creative energy.
                My journey began in fashion and graphic design, where I learned
                firsthand how style, story, and visuals can transform a brand’s
                presence. Building my own small business showed me the true
                power of a strong identity, and how the right strategy can set a
                business apart.
              </p>
              <p>
                Now, I channel everything I’ve learned into helping other
                businesses grow. I’ve had the privilege of partnering with
                standout brands and ambitious entrepreneurs who are ready to
                elevate their presence and make a real impact. My focus is
                always on helping you connect with the right people and turn
                your business into a brand that leaves a mark.
              </p>
              <p>
                At Spiral, we help you shape your vision, refine your message,
                and create an experience that sets you apart. We’re here to help
                you achieve more than just goals; we’re here to help you create
                lasting influence and success.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.bottomAccent} aria-hidden />
      </section>

      <section className={styles.brandStrip} aria-label="Brand strip">
        <div className={styles.brandStripInner}>
          <div className={styles.polaroidRow} aria-hidden="false">
            <div className={`${styles.polaroid} ${styles.polaroidLeft}`}>
              <div className={styles.polaroidClip} aria-hidden />
              <img
                className={styles.polaroidImage}
                src="/images/photos/DSC09041.jpg"
                alt="Foto del equipo"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className={`${styles.polaroid} ${styles.polaroidRight}`}>
              <div className={styles.polaroidClip} aria-hidden />
              <img
                className={styles.polaroidImage}
                src="/images/photos/DSC09102.jpg"
                alt="Foto del equipo"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <ClientMarquee />
        </div>
      </section>

      <InstagramGrid />
    </section>
  );
};

export default AboutModule;

