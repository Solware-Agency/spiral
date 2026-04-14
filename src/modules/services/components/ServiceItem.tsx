import React, { useEffect, useId, useState } from 'react';
import ResponsiveImg from '../../../components/ResponsiveImg';
import styles from '../styles/services.module.css';

const SERVICE_IMAGE_SIZES = '(max-width: 900px) 100vw, min(42vw, 720px)';

const titleForPackagesPanel = (t) => t.replace(/\n/g, ' ');

const PACKAGES_CONTACT_URL =
  'https://spiralstudio.hbportal.co/public/66343620b1546100287cdd19';

const ServiceItem = ({ id, title, description, imageUrl, packageDetail }) => {
  const [isPackageOpen, setIsPackageOpen] = useState(false);
  const detailsId = useId();

  useEffect(() => {
    if (!isPackageOpen) return () => {};
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsPackageOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPackageOpen]);

  const hasPackages = Boolean(packageDetail?.length);

  return (
    <article className={styles.serviceItem}>
      <div className={styles.serviceItemMain}>
        <div className={styles.serviceInfo}>
          <div className={styles.serviceTop}>
            <span className={styles.serviceNumber}>{id}</span>
            <h2 className={styles.serviceTitle} data-service-id={id}>
              {title}
            </h2>
          </div>
          <p className={styles.serviceDescription}>{description}</p>
        </div>

        <div className={styles.serviceMedia}>
          <ResponsiveImg
            className={styles.serviceImage}
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            sizes={SERVICE_IMAGE_SIZES}
          />
          <button
            type="button"
            className={styles.packagesBtn}
            onClick={() => hasPackages && setIsPackageOpen((v) => !v)}
            aria-expanded={isPackageOpen}
            aria-controls={hasPackages ? detailsId : undefined}
            disabled={!hasPackages}
          >
            PACKAGES
          </button>
        </div>
      </div>

      {hasPackages ? (
        <div
          className={`${styles.packageSlideRegion} ${isPackageOpen ? styles.packageSlideRegionOpen : ''}`}
        >
          <div className={styles.packageSlideInner}>
            <div
              id={detailsId}
              className={styles.packageSlidePanel}
              role="region"
              aria-labelledby={`${detailsId}-heading`}
              aria-hidden={!isPackageOpen}
              inert={!isPackageOpen}
            >
              <div className={styles.packageSlideHeader}>
                <span className={styles.packageSlideKicker}>Package details</span>
                <h3
                  id={`${detailsId}-heading`}
                  className={styles.packageSlideTitle}
                  data-service-id={id}
                >
                  {titleForPackagesPanel(title)}
                </h3>
              </div>
              <div className={styles.packageSlideBody}>
                {packageDetail.map((paragraph, i) => (
                  <p key={i} className={styles.packageSlideParagraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className={styles.packageSlideFooter}>
                <a
                  href={PACKAGES_CONTACT_URL}
                  className={styles.packageSlideBook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact us
                </a>
                <button
                  type="button"
                  className={styles.packageSlideCollapse}
                  onClick={() => setIsPackageOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
};

export default ServiceItem;

