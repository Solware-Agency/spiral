import React, { useState } from 'react';
import type { PackageTier } from '../data/socialMediaPackages';
import styles from '../styles/services.module.css';

const PACKAGES_CONTACT_URL =
  'https://spiralstudio.hbportal.co/public/66343620b1546100287cdd19';

type SocialMediaPackageTabsProps = {
  tiers: PackageTier[];
  panelId: string;
};

const SocialMediaPackageTabs = ({ tiers, panelId }: SocialMediaPackageTabsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTier = tiers[activeIndex];

  return (
    <div className={styles.packageTabs}>
      <div className={styles.packageTabList} role="tablist" aria-label="Social media packages">
        {tiers.map((tier, index) => {
          const tabId = `${panelId}-tab-${tier.id}`;
          const isActive = index === activeIndex;

          return (
            <button
              key={tier.id}
              type="button"
              id={tabId}
              role="tab"
              className={`${styles.packageTab} ${isActive ? styles.packageTabActive : ''}`}
              aria-selected={isActive}
              aria-controls={`${panelId}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveIndex(index)}
            >
              {tier.name}
            </button>
          );
        })}
      </div>

      <div
        id={`${panelId}-panel`}
        role="tabpanel"
        className={styles.packageTabPanel}
        data-active-tab={activeIndex}
        aria-labelledby={`${panelId}-tab-${activeTier.id}`}
      >
        <p className={styles.packageTabDescription}>{activeTier.description}</p>
        <ul className={styles.packageTabFeatures}>
          {activeTier.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
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

export default SocialMediaPackageTabs;
