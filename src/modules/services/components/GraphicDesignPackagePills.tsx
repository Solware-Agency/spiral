import React from 'react';
import type { GraphicDesignCategory } from '../data/graphicDesignPackages';
import styles from '../styles/services.module.css';

const PACKAGES_CONTACT_URL =
  'https://spiralstudio.hbportal.co/public/66343620b1546100287cdd19';

type GraphicDesignPackagePillsProps = {
  categories: GraphicDesignCategory[];
};

const GraphicDesignPackagePills = ({ categories }: GraphicDesignPackagePillsProps) => {
  return (
    <div className={styles.packagePills}>
      <div className={styles.packagePillsRow} role="list" aria-label="Graphic design categories">
        {categories.map((category) => (
          <span
            key={category.id}
            role="listitem"
            className={`${styles.packagePill} ${
              category.variant === 'gray' ? styles.packagePillGray : styles.packagePillWhite
            }`}
          >
            {category.name}
          </span>
        ))}
      </div>

      <a
        href={PACKAGES_CONTACT_URL}
        className={styles.packageTabCta}
        target="_blank"
        rel="noopener noreferrer"
      >
        GET IN TOUCH!
      </a>
    </div>
  );
};

export default GraphicDesignPackagePills;
