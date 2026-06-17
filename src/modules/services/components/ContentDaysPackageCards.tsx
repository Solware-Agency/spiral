import React from 'react';
import type { ContentDaysPackageCard } from '../data/contentDaysPackages';
import styles from '../styles/services.module.css';

const PACKAGES_CONTACT_URL =
  'https://spiralstudio.hbportal.co/public/66343620b1546100287cdd19';

type ContentDaysPackageCardsProps = {
  cards: ContentDaysPackageCard[];
};

const ContentDaysPackageCards = ({ cards }: ContentDaysPackageCardsProps) => {
  return (
    <div className={styles.packageCards}>
      <div className={styles.packageCardsRow}>
        {cards.map((card) => (
          <article
            key={card.id}
            className={`${styles.packageCard} ${
              card.variant === 'gray' ? styles.packageCardGray : styles.packageCardWhite
            }`}
          >
            <h3 className={styles.packageCardTitle}>{card.name}</h3>
            <hr className={styles.packageCardDivider} />
            <ul className={styles.packageCardFeatures}>
              {card.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
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

export default ContentDaysPackageCards;
