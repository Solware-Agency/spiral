import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/studio.module.css';

const CASA_LOGO_WHITE =
  '/images/spiral%20logos/SPIRAL%20Logos/Casa%20Spiral/Casa.spiral-white.png';

const bgSet = (id, w) =>
  `image-set(url("/images/optimized/${id}_${w}.webp") type("image/webp"), url("/images/optimized/${id}_${w}.jpg") type("image/jpeg"))`;
const bgVars = (id) => ({
  '--bg-960': bgSet(id, 960),
  '--bg-1280': bgSet(id, 1280),
  '--bg-1600': bgSet(id, 1600),
  '--bg-2560': bgSet(id, 2560),
  '--bg-3200': bgSet(id, 3200),
});

const features = [
  {
    id: '01',
    title: 'Creative\nAtmosphere',
    imageId: 'DSC01921',
  },
  {
    id: '02',
    title: 'Effortless\nSetup',
    imageId: 'DSC02521',
  },
  {
    id: '03',
    title: 'Modern\nAesthetic',
    imageId: 'IMG_6230',
  },
  {
    id: '04',
    title: 'Equipment\nIncluded',
    imageId: 'DSC02284',
  },
];

const galleryPhotos = [
  {
    src: '/images/photos/DSC02380.jpg',
    alt: 'Casa Spiral studio space',
  },
  {
    src: '/images/photos/DSC02040.jpg',
    alt: 'Studio content setup',
  },
  {
    src: '/images/photos/DSC01963.jpg',
    alt: 'Studio lighting and backdrop',
  },
  {
    src: '/images/photos/DSC04163.jpg',
    alt: 'Studio detail',
  },
  {
    src: '/images/photos/DSC09041.jpg',
    alt: 'Casa Spiral studio session',
  },
  {
    src: '/images/photos/DSC02545.jpg',
    alt: 'Studio creative corner',
  },
  {
    src: '/images/photos/DSC09102.jpg',
    alt: 'Casa Spiral studio detail',
  },
];

const galleryLayouts = [
  styles.galleryPos0,
  styles.galleryPos1,
  styles.galleryPos2,
  styles.galleryPos3,
  styles.galleryPos4,
  styles.galleryPos5,
  styles.galleryPos6,
];

const rates = [
  { hours: 2, weekday: 160, weekend: 170 },
  { hours: 3, weekday: 240, weekend: 245 },
  { hours: 4, weekday: 320, weekend: 330 },
  { hours: 5, weekday: 390, weekend: 395 },
  { hours: 6, weekday: 460, weekend: 465 },
  { hours: 7, weekday: 530, weekend: 530 },
  { hours: 8, weekday: 600, weekend: 600 },
];

const spaceDescription =
  'A photo studio in Miami designed for creative freedom, giving you everything you need in one private content space. Our backdrop section offers the three basics: white, black, and beige, with more colors coming soon. Enjoy a gorgeous sofa setup styled to fit any vibe, plus a director chair, side tables, and a creative corner for extra inspiration. You’ll also find props to enhance every shoot, from decorative plates and magazines to blankets, coffee mugs, and more. Whether you’re shooting a campaign, creating content, or just exploring new ideas, the studio is ready for you to walk in and create. Perfect for photographers, videographers, content creators, and influencers.';

const amenitiesLeft = [
  '2 GVM 150W continuous lights',
  '2 Westcott FJ400-SE flashes with trigger',
  'Westcott 4711 EL-Sony adapter',
  '42" TV for instant viewing',
  '3 paper backdrops (white, black, beige)',
];

const amenitiesRight = [
  'Rolling cart for easy gear access',
  'Phone tripod',
  'Camera tripod with adapter',
  'Bluetooth mics',
];

const StudioModule = () => {
  const money = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }),
    []
  );

  return (
    <section className={styles.studio}>
      <section
        className={styles.hero}
        aria-label="The Studio hero"
        style={bgVars('DSC01989')}
      >
        <div className={styles.heroOverlay} aria-hidden />
        <img
          className={styles.heroLogo}
          src={CASA_LOGO_WHITE}
          alt="CASA SPIRAL"
          loading="eager"
          decoding="async"
        />
      </section>

      <section className={styles.intro} aria-label="Welcome to Casa Spiral">
        <div className={styles.introInner}>
          <p className={styles.introKicker}>WELCOME TO</p>
          <h1 className={styles.introTitle}>CASA SPIRAL</h1>
          <p className={styles.introBody}>
            A creative space designed for photoshoots, content creation, and bold
            ideas.
          </p>
        </div>
      </section>

      <section className={styles.features} aria-label="Studio features">
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <article
              key={f.id}
              className={styles.featureCard}
              style={bgVars(f.imageId)}
              aria-label={f.title.replace('\n', ' ')}
            >
              <div className={styles.featureOverlay} aria-hidden />
              <div className={styles.featureCopy}>
                <span className={styles.featureNumber}>{f.id}</span>
                <span className={styles.featureTitle}>
                  {f.title.split('\n').map((line) => (
                    <span key={line} className={styles.featureTitleLine}>
                      {line}
                    </span>
                  ))}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.details} aria-label="Studio details">
        <div className={styles.detailsInner}>
          <section className={styles.spaceCard} aria-label="The space">
            <h2 className={styles.cardLabel}>THE SPACE</h2>
            <p className={styles.cardBody}>{spaceDescription}</p>
          </section>

          <section className={styles.amenitiesCard} aria-label="Equipment">
            <h2 className={styles.amenitiesLabel}>EQUIPMENT</h2>
            <p className={styles.amenitiesIntro}>
              Our studio comes fully equipped to make your shoot seamless and
              professional:
            </p>

            <div className={styles.amenitiesGrid}>
              <ul className={styles.amenitiesList}>
                {amenitiesLeft.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <ul className={styles.amenitiesList}>
                {amenitiesRight.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <p className={styles.amenitiesOutro}>
              Everything you need is ready and waiting, just bring your vision!
            </p>
          </section>
        </div>
      </section>

      <section className={styles.ctaBanner} aria-label="Book the studio">
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>
            <span className={styles.ctaCaps}>CREATE YOUR NEXT</span>
            <span className={styles.ctaScript}>Masterpiece</span>
          </h2>
          <Link to="/book-now" className={styles.ctaButton}>
            BOOK NOW!
          </Link>
        </div>
      </section>

      <section className={styles.galleryWrap} aria-label="Studio gallery">
        <div className={styles.galleryGrid}>
          {galleryPhotos.map((photo, idx) => (
            <figure
              key={`${photo.src}-${idx}`}
              className={`${styles.galleryFigure} ${galleryLayouts[idx] ?? ''}`}
            >
              <img
                className={styles.galleryImg}
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
              />
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.rates} aria-label="Studio rates">
        <div className={styles.ratesInner}>
          <div className={styles.ratesLeft}>
            <p className={styles.ratesKicker}>STUDIO RATES</p>

            <table className={styles.ratesTable}>
              <thead>
                <tr>
                  <th scope="col"># HOURS</th>
                  <th scope="col">WEEK DAY</th>
                  <th scope="col">WEEKEND</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r.hours}>
                    <td>{r.hours} HOURS</td>
                    <td>{money.format(r.weekday)}</td>
                    <td>{money.format(r.weekend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className={styles.ratesNote}>
              Get special rates for bookings over 8 hours or for multiple days.
              Reach out to us directly to reserve your spot.
            </p>
          </div>

          <div className={styles.ratesRight} aria-hidden="true">
            <div className={styles.polaroid}>
              <div className={styles.polaroidClip} />
              <div
                className={styles.polaroidPhoto}
                style={{ backgroundImage: "url('/images/photos/DSC09031.jpg')" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.mapSection} aria-label="Google Maps">
        <div className={styles.mapEmbedWrap}>
          <iframe
            className={styles.mapEmbed}
            title="Casa Spiral on Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            src="https://www.google.com/maps?q=782+NW+42nd+Ave+Miami+FL+33126&output=embed"
          />
        </div>
        <div className={styles.mapFooter}>
          782 NW 42ND AVE MIAMI FL 33126
        </div>
      </section>
    </section>
  );
};

export default StudioModule;

