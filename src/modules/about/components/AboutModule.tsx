import React from 'react';
import { Link } from 'react-router-dom';
import LogoPicture from '../../../components/LogoPicture';
import ResponsiveImg from '../../../components/ResponsiveImg';
import { LOGO_SIZES, SPIRAL_LOGO_PNG, SPIRAL_LOGO_SLUG } from '../../../data/logoSources';
import styles from '../styles/about.module.css';

const POLAROID_SIZES = '(max-width: 900px) 72vw, min(42vw, 820px)';
const FOUNDER_SIZES = '(max-width: 900px) 92vw, min(44vw, 640px)';
const STRIP_POLAROID_SIZES = '(max-width: 900px) 94vw, min(54vw, 780px)';
import ClientMarquee from './ClientMarquee';
import InstagramGrid from '../../home/components/InstagramGrid';

const AboutModule = () => {
  return (
    <section className={styles.about}>
      <section className={styles.hero} aria-label="About hero">
        <div className={styles.heroOverlay} aria-hidden />

        <div className={styles.heroMonogram} aria-hidden>
          <LogoPicture
            slug={SPIRAL_LOGO_SLUG.iconWhite}
            pngSrc={SPIRAL_LOGO_PNG.iconWhite}
            className={styles.monogramIcon}
            alt=""
            sizes={LOGO_SIZES.aboutMonogram}
            loading="eager"
            decoding="async"
            aria-hidden="true"
          />
        </div>

        <div className={styles.heroInner}>
          <h1 className={styles.heroKicker}>WE ARE SPIRAL</h1>
        </div>
      </section>

      <section className={styles.specializeWrap}>
        <div className={styles.specializeInner}>
          <div className={styles.specializeGrid}>
            <div className={styles.specializeCopy}>
              <p className={styles.label}>WHAT WE SPECIALIZE IN</p>

              <p className={styles.lead}>
                Spiral was created for brands that break the rules. For those who
                <br />
                want to be <strong>seen</strong>, heard, and{' '}
                <strong>remembered</strong>. We work with
                <br />
                businesses that aren’t afraid to push boundaries, own their
                <br />
                story, and make their mark
                in bold, <strong>authentic</strong> ways.
              </p>

              <p className={styles.body}>
                We specialize in social media management, content creation, and graphic design, offering a la carte
                <br />
                and customizable packages to fit every brand’s unique needs. Whether you want to be hands-on
                <br />
                or step back and let us manage it all, we’ll make sure your brand is always
                <br />
                seen, heard, and remembered in a way that feels true to you.
                <br />
                {/* spacer line via <br/> requirement */}
              </p>

              <Link to="/#contact-us" className={styles.cta}>
                WORK WITH US
              </Link>
            </div>

            <div className={styles.specializeSpacer} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.specializePolaroid} aria-hidden="true">
          <div className={styles.specializePolaroidCard} aria-hidden>
            <ResponsiveImg
              className={`${styles.polaroidPngImage} ${styles.specializePolaroidImage}`}
              src="/Polaroids/3.png"
              alt=""
              loading="eager"
              decoding="async"
              sizes={POLAROID_SIZES}
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section className={styles.founderSection} aria-label="Founder">
        <div className={styles.founderGrid}>
          <div className={styles.founderPhotoWrap}>
            <ResponsiveImg
              className={styles.founderPhoto}
              src="/images/photos/IMG_9072.JPG"
              alt="Andrea Suarez"
              loading="lazy"
              decoding="async"
              sizes={FOUNDER_SIZES}
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
            <div className={styles.polaroidLeft}>
              <ResponsiveImg
                className={styles.polaroidPngImage}
                src="/Polaroids/1.png"
                alt="Foto del equipo"
                loading="lazy"
                decoding="async"
                sizes={STRIP_POLAROID_SIZES}
              />
            </div>

            <div className={styles.polaroidRight}>
              <ResponsiveImg
                className={styles.polaroidPngImage}
                src="/Polaroids/2.png"
                alt="Foto del equipo"
                loading="lazy"
                decoding="async"
                sizes={STRIP_POLAROID_SIZES}
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

